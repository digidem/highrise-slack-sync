# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.2.2](https://github.com/digidem/highrise-slack-sync/compare/v2.2.1...v2.2.2) (2025-03-13)


### Bug Fixes

* actually fix retry (forgot to include post) ([d4be914](https://github.com/digidem/highrise-slack-sync/commit/d4be914baf619e9cc261ea802f1c1b8e96b604ac))

### [2.2.1](https://github.com/digidem/highrise-slack-sync/compare/v2.2.0...v2.2.1) (2025-03-13)


### Bug Fixes

* respect Slack's retry-after header ([54c3def](https://github.com/digidem/highrise-slack-sync/commit/54c3def3464326e0280245b5163cf1d167d6668c))

## [2.2.0](https://github.com/digidem/highrise-slack-sync/compare/v2.1.2...v2.2.0) (2025-03-13)


### Features

* rate limit sending webhooks to Slack ([5e929f2](https://github.com/digidem/highrise-slack-sync/commit/5e929f26b53aff04a3803bfc223c29512a9bdefe))

### [2.1.2](https://github.com/digidem/highrise-slack-sync/compare/v2.1.1...v2.1.2) (2024-07-15)

### [2.1.1](https://github.com/digidem/highrise-slack-sync/compare/v2.1.0...v2.1.1) (2024-07-15)


### Bug Fixes

* show email if subject name is not defined ([cc4d924](https://github.com/digidem/highrise-slack-sync/commit/cc4d9244e509a245d09dbfa04efb977d7c6bb851))

## [2.1.0](https://github.com/digidem/highrise-slack-sync/compare/v2.0.0...v2.1.0) (2024-07-15)


### Features

* limit number of pages to get from Highrise ([32b20aa](https://github.com/digidem/highrise-slack-sync/commit/32b20aafd8749b30692879cac897e90932c7245d))


### Bug Fixes

* count requests in hook to count retries ([a193c37](https://github.com/digidem/highrise-slack-sync/commit/a193c37eac752f12d0d5ed7d93a2786646dece6b))
* fix zero-counting to keep in requestLimit ([43d5e5a](https://github.com/digidem/highrise-slack-sync/commit/43d5e5a1814a5769a996b93a96ae536c17bfbd5c))

## [2.0.0](https://github.com/digidem/highrise-slack-sync/compare/v1.1.4...v2.0.0) (2024-07-15)


### ⚠ BREAKING CHANGES

* min Node v18 due to switch to ky
v1 which depends on native fetch

### Features

* limit number of requests per run ([7d5730b](https://github.com/digidem/highrise-slack-sync/commit/7d5730b87d307d1b503ff1ec00f30c2a2c6d66bf))


* update deps ([1caa030](https://github.com/digidem/highrise-slack-sync/commit/1caa030d495d8ecea092c8edb3688755d3588f34))

### [1.1.4](https://github.com/digidem/highrise-slack-webhook/compare/v1.1.3...v1.1.4) (2023-04-12)


### Bug Fixes

* fix error for missing subject ([b340299](https://github.com/digidem/highrise-slack-webhook/commit/b340299c4bb0c75202df725c492cd25a2e355816))

### [1.1.3](https://github.com/digidem/highrise-slack-webhook/compare/v1.1.2...v1.1.3) (2023-01-16)


### Bug Fixes

* Fix highrise params ([af793fe](https://github.com/digidem/highrise-slack-webhook/commit/af793fe13321fec41dc50841125fb46bce6297ba))
* workaround for error on Cloudflare Workers ([ef31dba](https://github.com/digidem/highrise-slack-webhook/commit/ef31dbabd0082f64a681071f707b9aafd801f5b5))

### [1.1.2](https://github.com/digidem/highrise-slack-webhook/compare/v1.1.1...v1.1.2) (2023-01-12)


### Bug Fixes

* avoid passing param n: undefined ([cd27d87](https://github.com/digidem/highrise-slack-webhook/commit/cd27d87c06d7d4246bd64ad2d6e8b431c566819c))
* failure when author no longer exists as user ([f9626f5](https://github.com/digidem/highrise-slack-webhook/commit/f9626f5fef1fda34dc8983d7172bcf484c97299e))

### [1.1.1](https://github.com/digidem/highrise-slack-webhook/compare/v1.1.0...v1.1.1) (2023-01-12)


### Bug Fixes

* update package-lock ([a22e5b5](https://github.com/digidem/highrise-slack-webhook/commit/a22e5b5f3fc2ef40ba7562852c4efba14f10471f))

## 1.1.0 (2023-01-12)


### Features

* Also sync highrise comments to Slack ([b19e8d2](https://github.com/digidem/highrise-slack-webhook/commit/b19e8d27e820ac1edde06d51228be946e1651629))


### Bug Fixes

* Fix email parsing (was truncating first lines of messages) ([0754d37](https://github.com/digidem/highrise-slack-webhook/commit/0754d37ed71252376cebdcea39a2cc05fe4063af))
* Fix retry code ([307cda1](https://github.com/digidem/highrise-slack-webhook/commit/307cda1a016d774e1b1c82d72772434c59226847))
* Fix silly error getting subject ([28d3c85](https://github.com/digidem/highrise-slack-webhook/commit/28d3c85982572c0948a1f42bef2ae630410d36c8))
* Handle notes and emails about companies as well as people ([edcb5dc](https://github.com/digidem/highrise-slack-webhook/commit/edcb5dc845e2f3c293c9a77bc6f07cca2b57160d))
* include types in npm publish ([0848790](https://github.com/digidem/highrise-slack-webhook/commit/084879023d9c11c451ade1e9e08d45ccc030e92c))
* only sync notes for parties ([1923a51](https://github.com/digidem/highrise-slack-webhook/commit/1923a51257465739a062c89fcd85bcea4bcc5f3e))
* Update last check data correctly ([aa3e0d4](https://github.com/digidem/highrise-slack-webhook/commit/aa3e0d42a764fa19a27d41568ba6f41199a3add0))
