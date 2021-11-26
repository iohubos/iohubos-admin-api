# Project IOhubOS Admin API

[![License](https://img.shields.io/github/license/iohubos/iohubos-admin-api.svg)](LICENSE)
[![CircleCI Build Status](https://circleci.com/gh/iohubos/iohubos-admin-api/tree/master.svg?style=shield)](https://circleci.com/gh/iohubos/iohubos-admin-api/tree/master)

Admin API for IOhubOS instances.

Through the admin api you can:

* deploy/undeploy Docker compose applications
* enable/disable Docker compose applications at startup
* get information about the deployed applications
* reboot the IOhubOS instance

## HTTP API endpoints

Swagger API documentation is available [here](https://app.swaggerhub.com/apis-docs/iohubos/iohubos-admin-api/1.0.0).

### Authorization

All the endpoints require a valid token in the `X-API-Token` header.

## Environment variables

* `PORT`: Server http port (default: 8080)
* `API_TOKEN`: Pre-shared token for all the endpoints.
* `ROOT_DOCKER_FOLDER`: Folder for IOhubOS applications internal mount point (default: `/mnt`).
* `DEST_DOCKER_FOLDER`: Folder for IOhubOS applications final dest folder (default: `/iohub/docker/apps`).
* `ROOT_DOCKER_GLOBAL_VOLUME`: name of the global IOhubOS volume (default: `global-vol`).

## Notes

The reboot function is working only on Debian based systems. It is designed to work in IOhubOS instances.

## Execution in a Docker instance

The image must be run with the the privileged flag, otherwise the reboot function will not work.
Moreover the iohub application folder mu be mounted in the Docker instance.

```bash
docker run \
    -d \
    --rm \
    --name iohubos-admin-api \
    -p 8080:8080 \
    --privileged \
    -v /iohub/docker/apps:/mnt \
    -e ROOT_DOCKER_FOLDER=/mnt \
    -e API_TOKEN="<my secure token>" \
    ezvpn/iohubos-admin-api
```

## License

IOhubOS is distributed under the terms of The GNU Affero General Public License v3.0.

See [LICENSE](LICENSE) for details.

SPDX-License-Identifier: AGPL-3.0-only

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
