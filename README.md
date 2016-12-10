# RBFS

REST based file-server

RBFS provides a RESTful, JSON based, interface to a file system.

Highlights:

- Confirm file integrity with MD5 checking.
- Store user defined meta-data along with the files.
- Automatically builds directory necessary directory structure.
- HTTP basic support.
- IP whitelisting or blacklisting.
- Store and retrieve the history of file changes.
- File vs. directory action detection.
- Automatic mimetype header setting based on extention.


## Getting Started

The two easiest ways to get up and running are:

Use Docker:

```
git clone http://github.com/cidrblock/rbfs
cd rbfs && mkdir tempdir && mkdir rootdir
docker build -t rbfs .
docker run -p 8080:8080 --rm -it rbfs

```

or straight node.js

```
git clone http://github.com/cidrblock/rbfs
cd rbfs && mkdir tempdir && mkdir rootdir
npm install
node server.js
```

## Examples

These examples all use [httpie](https://httpie.org/)

### Example from linux:
- Create and PUT a file in arbitrary folder
- Check the MD5 on the server-side
- Add some meta-data

```
bash-4.3$ mkfile -n 1G 1G
bash-4.3$ http -a admin:changeme -f PUT http://localhost:8080/api/v1/some/nested/directory/1G file@1G md5=`md5 -q 1G` author='Bradley A. Thornton'

HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 206
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Dec 2016 00:02:00 GMT
ETag: W/"ce-maKkq8+wpvNGTf/stRwgGA"
X-Powered-By: Express

{
    "data": {
        "history": "http://localhost:8080/api/v1/history/some/nested/directory/1G",
        "md5": "cd573cfaace07e7949bc0c46028904ff",
        "url": "http://localhost:8080/api/v1/some/nested/directory/1G"
    },
    "status": "success"
}
```

See the history

```
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/history/some/nested/directory/1G
HTTP/1.1 200 OK
Connection: keep-alive
Content-Type: application/json
Date: Sat, 10 Dec 2016 00:03:26 GMT
Transfer-Encoding: chunked
X-Powered-By: Express

[
    {
        "action": "created",
        "humanSize": "1 GB",
        "md5": "cd573cfaace07e7949bc0c46028904ff",
        "md5Validated": true,
        "md5ValidationRequested": true,
        "modified": "2016-12-10T00:01:57.000Z",
        "size": 1073741824,
        "sourceDNSName": "",
        "sourceIP": "::1",
        "userData": {
            "author": "Bradley A. Thornton",
            "md5": "cd573cfaace07e7949bc0c46028904ff"
        }
    }
]
```

Get the MD5

```
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/md5/some/nested/directory/1G
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 70
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Dec 2016 00:04:17 GMT
ETag: W/"46-JGlQfGKqF5KYpDQEqLj4HA"
X-Powered-By: Express

{
    "data": {
        "md5": "cd573cfaace07e7949bc0c46028904ff"
    },
    "status": "success"
}
```

Get a directory listing

```
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 929
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Dec 2016 00:05:15 GMT
ETag: W/"3a1-QdFb8lPBSNE+FmXLACvTBQ"
X-Powered-By: Express

{
    "data": {
        "children": [
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "extension": "",
                                        "history": "http://localhost:8080/api/v1/history/some/nested/directory/1G",
                                        "humanSize": "1 GB",
                                        "mimeType": "application/octet-stream",
                                        "modified": "2016-12-10T00:01:57.000Z",
                                        "name": "1G",
                                        "path": "/some/nested/directory/1G",
                                        "size": 1073741824,
                                        "type": "file",
                                        "url": "http://localhost:8080/api/v1/some/nested/directory/1G"
                                    }
                                ],
                                "humanSize": "1 GB",
                                "modified": "2016-12-10T00:02:00.000Z",
                                "name": "directory",
                                "path": "/some/nested/directory",
                                "size": 1073741824,
                                "type": "directory"
                            }
                        ],
                        "humanSize": "1 GB",
                        "modified": "2016-12-10T00:01:57.000Z",
                        "name": "nested",
                        "path": "/some/nested",
                        "size": 1073741824,
                        "type": "directory"
                    }
                ],
                "humanSize": "1 GB",
                "modified": "2016-12-10T00:01:57.000Z",
                "name": "some",
                "path": "/some",
                "size": 1073741824,
                "type": "directory"
            }
        ],
        "humanSize": "1 GB",
        "modified": "2016-12-10T00:01:57.000Z",
        "name": "",
        "path": "/",
        "size": 1073741824,
        "type": "directory"
    },
    "status": "success"
}
```




USe docker

RBFS provides a single-file `server.js` node controller with 2 core dependencies -
* [Restify](http://mcavage.github.io/node-restify)
* [node-fs-extra](https://github.com/jprichardson/node-fs-extra). The file contains a `config` object which allows for easy configuration.
* [md5-file](https://www.npmjs.com/package/md5-file) Calculates an MD5 for the saved file.

### Installation

MacOS: `npm install --no-optional`

### Security

The server provides 3 levels of security:

1. Key-Based: Each request requires a key be submitted in the URL
2. IP Restrictions: Supports specific IP addresses and ranges using wildcards (`*`)
3. HTTPS Support: Simply supplying a PEM-encoded key and certificate file will require HTTPS requests

### Configuration

The server uses a `config` object to easily setup how it will run:

**Keys**

The `config.keys` array simply contains a list of keys that get sent along with the request.

**IP Restrictions**

The `config.ips` array allows providing a list of allowed IP addresses and ranges. Several format examples are:

```
"*.*.*.*"      // Allow all IP's through
"192.168.*.*"  // Allow only IP's on the 192.168.(...) range to make requests
"192.168.1.1"  // Allow only the specific address to make requests
```

**SSL Certificate**

An SSL Certificate can be supplied by providing a PEM-encoded `key` and `cert`. Setting either or both of these properties to `false` results in no SSL.

**Port**

The `config.port` property sets the server port to be used.

**Base Directory**

The `config.base` property sets the base (or root) directory where files will reside. This is relative to the server file.

**Create Mode**

The `config.cmode` sets the permissions that will be applied on file creation. Default is `0755`.

## Usage

Requests to the server are made via RESTful methods - GET, PUT, POST and DELETE. Below is a breakdown of the methods and their associated methods:

### GET (Read)

**Directory Listing**

`GET => {server}:{port}/{key}/dir/{path}`

**Read File**

`GET => {server}:{port}/{key}/file/{path}`

### POST (Create)

**Create Directory**

`POST => {server}:{port}/{key}/dir/{path}`

**Create File**

`POST => {server}:{port}/{key}/file/{path}`


Examples:

Create an empty file:

```
curl -X POST  localhost:8080/12345/file/foo.txt
```

Create a file with a file: (MD5 hash returned for saved file)

```
$ md5 foo.txt
MD5 (foo.txt) = 3b1340c072317b95529b826b6696c6ab
$ curl -X POST  -F filedata=@foo.txt localhost:8080/12345/file/foo.txt
{"status":"success","data":"3b1340c072317b95529b826b6696c6ab"}
```

Create a file with text

```
curl -X POST -F data='{"some": "text"}' localhost:8080/12345/file/foo.txt
```

**Copy Directory or File**

`POST => {server}:{port}/{key}/copy/{path}`

`POST` parameter `destination` required with the FULL detination path

### PUT (Update)

**Rename File or Directory**

`PUT => {server}:{port}/{key}/rename/{path}`

`PUT` parameter `name` required with the new file or directory name (no path required)

**Save Contents to File**

`PUT => {server}:{port}/{key}/file/{path}`

Examples:

Update file with file:

```
$ md5 foo.txt
MD5 (foo.txt) = 3b1340c072317b95529b826b6696c6ab
$ curl -X PUT -F filedata=@foo.txt localhost:8080/12345/file/foo.txt
{"status":"success","data":"3b1340c072317b95529b826b6696c6ab"}
```
Update file with text:

```
curl -X PUT -F data='{"some": "text"}' localhost:8080/12345/file/foo.txt
{"status":"success","data":null}
```

### DELETE

**Delete a File or Directory**

`DELETE => {server}:{port}/{key}/{path}`

## Responses

### Authentication Failure

All authentication failures will result in an http 401 status (Not Authorized)

### Success Response

On a successful request the server will respond with the following JSON formatted return:

```
{
  "status": "success",
  "data": "{any return data}"
}
```

Most successful responses will contain `null` for data.

### Error Response

On an erroroneous request the server will respond with the following JSON formatted return:

```
{
  "status": "error",
  "code": "{3-digit error response code}",
  "message": "{brief explanation of error condition}",
  "raw": "{raw error message from node}"
}
```
