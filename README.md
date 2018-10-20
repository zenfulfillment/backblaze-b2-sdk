# Backblaze B2 SDK

Simple backblaze b2 sdk for nodejs.

This is a work in progress, only the upload file function is supported in the sdk.

## Installation

`$ npm install --save backblaze-b2-sdk`

## Usage

```js
(async () => {
  const b2 = BackblazeB2({accountId: ACCOUNT_ID, masterApplicationKey: MASTER_APPLICATION_KEY});

  // Calling this method is optional, every sdk method will call this method if no previous authorization was made
  // The authorization token will be cached in a private variable for every other method to use
  await b2.authorizeAccount();

  const {authorizationToken, uploadUrl} = await b2.getUploadUrl({bucketId: '123'});

  await b2.uploadFile({
    authorizationToken,
    uploadUrl,
    fileName: 'test.txt',
    fileContent: Buffer.from('test content')
  });
})();
```
