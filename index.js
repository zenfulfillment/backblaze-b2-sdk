const crypto = require('crypto');
const axios = require('axios');

const BackblazeB2 = ({accountId, masterApplicationKey, version = 'v2'}) => {
  const authApiUrl = 'https://api.backblazeb2.com/b2api/v2/b2_authorize_account';
  let authorizationToken = '';
  let downloadUrl = '';
  let apiUrl = '';

  return ({
    async authorizeAccount() {
      if (authorizationToken) {
        return;
      }

      const {data} = await axios({
        method: 'get',
        url: authApiUrl,
        auth: {
          username: accountId,
          password: masterApplicationKey
        }
      });

      authorizationToken = data.authorizationToken;
      downloadUrl = data.downloadUrl;
      apiUrl = `${data.apiUrl}/b2api/${version}/`;
    },

    async deleteFileVersion({fileName, fileId}) {
      if (!authorizationToken) {
        await this.authorizeAccount();
      }

      const operation = 'b2_delete_file_version';

      return axios({
        method: 'post',
        url: `${apiUrl}${operation}`,
        data: {
          fileName,
          fileId
        },
        headers: {
          Authorization: authorizationToken
        }
      })
        .then(({data}) => data);
    },

    async downloadFileById({fileId}) {
      if (!downloadUrl || !authorizationToken) {
        await this.authorizeAccount();
      }
      const route = `/b2api/v2/b2_download_file_by_id?fileId=${fileId}`;
      return axios({
        method: 'get',
        url: `${downloadUrl}${route}`,
        headers: {
          Authorization: authorizationToken
        }
      })
        .then(({data}) => data);
    },

    async getUploadUrl({bucketId}) {
      if (!authorizationToken) {
        await this.authorizeAccount();
      }

      const operation = 'b2_get_upload_url';

      return axios({
        method: 'post',
        url: `${apiUrl}${operation}`,
        data: {
          bucketId
        },
        headers: {
          Authorization: authorizationToken
        }
      })
        .then(({data}) => data);
    },

    async uploadFile(params) {
      if (!authorizationToken) {
        await this.authorizeAccount();
      }

      const hash = sha1(params.fileContent);

      return axios({
        maxContentLength: 100 * 1024 * 1024, // 100 MB
        method: 'post',
        url: `${params.uploadUrl}`,
        data: params.fileContent,
        headers: {
          Authorization: params.authorizationToken,
          'X-Bz-File-Name': encodeURI(params.fileName),
          'Content-Type': params.contentType || 'b2/x-auto',
          'Content-Length': params.fileContent.length + hash.length,
          'X-Bz-Content-Sha1': hash
        }
      })
        .then(({data}) => data);
    }
  });
};

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}

module.exports = {BackblazeB2};
