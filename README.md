[![Build Status](https://travis-ci.org/cidrblock/RBFS.svg?branch=master)](https://travis-ci.org/cidrblock/RBFS)

# RBFS (REST based file-server)

RBFS provides a RESTful, JSON based, interface to a file system.

Highlights:

- Confirm file integrity with MD5 checking.
- Store user defined meta-data along with the files.
- Tracks file change and MD5 history
- Automatically builds necessary directory structure.
- HTTP basic authentication support.
- IP whitelisting or blacklisting.
- Store and retrieve the history of file changes.
- File vs. directory action detection.
- Automatic mimetype header setting based on extention.
- SSL support
- Records source IP and DNS name.


## Getting Started

The easiest ways to get up and running are:

Use Docker:

```
git clone http://github.com/cidrblock/rbfs
cd rbfs && mkdir tempdir && mkdir rootdir
docker build -t rbfs .
docker run -p 8080:8080 --rm -it rbfs

```

straight node.js

```
git clone http://github.com/cidrblock/rbfs
cd rbfs && mkdir tempdir && mkdir rootdir
npm install
node server.js
```

try using [heroku](https://admin:changeme@cidrblock-rbfs.herokuapp.com/api/v1/)

```bash
date > file.txt && http -a admin:changeme -f PUT http
s://cidrblock-rbfs.herokuapp.com/api/v1/a/b/c/d/file.txt file@file.txt
```
```javascript
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 218
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Dec 2016 22:25:46 GMT
Etag: W/"da-yZydpMugW3MEeRxGULF/xg"
Server: Cowboy
Via: 1.1 vegur
X-Powered-By: Express

{
    "data": {
        "history": "http://cidrblock-rbfs.herokuapp.com/api/v1/history/a/b/c/d/file.txt",
        "md5": "f4a066f5271b66dbb911c892ab0b3488",
        "url": "http://cidrblock-rbfs.herokuapp.com/api/v1/a/b/c/d/file.txt"
    },
    "status": "success"
}
```
## Examples

These examples all use [httpie](https://httpie.org/).

### Example from linux:
- Create and PUT a file in arbitrary folder
- Check the MD5 on the server-side
- Add some meta-data

```bash
bash-4.3$ mkfile -n 1G 1G
bash-4.3$ http -a admin:changeme -f PUT http://localhost:8080/api/v1/some/nested/directory/1G file@1G md5=`md5 -q 1G` author='Bradley A. Thornton'
```
```javascript
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

#### See the history

```bash
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/history/some/nested/directory/1G
```
```javascript
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

#### Get the MD5

```bash
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/md5/some/nested/directory/1G
```
```javascript
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

#### Get a directory listing

```bash
bash-4.3$ http -a admin:changeme http://localhost:8080/api/v1/
```
```javascript
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

#### Delete it all:

```bash
bash-4.3$ http -a admin:changeme DELETE http://localhost:8080/api/v1/
```
```javascript
HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: 38
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Dec 2016 00:08:46 GMT
ETag: W/"26-IaA8q5+qekcb2RemoCWbIQ"
X-Powered-By: Express

{
    "data": "Deleted.",
    "status": "success"
}
```

### Example from a network device:

- copy the running config to a file

```
ios#copy run ios.cfg
Destination filename [ios.cfg]?

34824 bytes copied in 2.120 secs (16426 bytes/sec)
ios#
```


#### Get the MD5

```
ios#verify /md5 ios.cfg
.........Done!
verify /md5 (flash:ios.cfg) = 7c0f5c0733cf766f004bb33470ac87f1

```

#### Copy it to RBFS

```
ios#copy ios.cfg http://admin:changeme@10.13.214.241:8080/api/v1/configurations/ios.cfg
Address or name of remote host [10.13.214.241]?
Destination filename [api/v1/configurations/ios.cfg]?
Storing http://**************@10.13.214.241:8080/api/v1/configurations/ios.cfg !
34824 bytes copied in 4.812 secs (7237 bytes/sec)
```

#### Retrieve the MD5

```
ios#copy http://admin:changeme@10.13.214.241:8080/api/v1/md5/configurations/ios.cfg ios.cfg.md5
Destination filename [ios.cfg.md5]?
Loading http://**************@10.13.214.241:8080/api/v1/md5/configurations/ios.cfg
70 bytes copied in 0.532 secs (132 bytes/sec)
ios#more ios.cfg.md5
{"status":"success","data":{"md5":"7c0f5c0733cf766f004bb33470ac87f1"}}
```

#### Visually compare

match: (upload was successful)

#### Get the directory Listing

```
ios#copy http://admin:changeme@10.13.214.241:8080/api/v1/configurations/ dirlist.json
Source filename [api/v1/configurations/]?
Destination filename [dirlist.json]?
Loading http://**************@10.13.214.241:8080/api/v1/configurations/ !
522 bytes copied in 0.516 secs (1012 bytes/sec)
ios#more dirlist.json
{"status":"success","data":{"path":"/configurations/","name":"configurations","modified":"2016-12-10T00:26:25.000Z","type":"directory","children":[{"path":"/configurations/ios.cfg","name":"ios.cfg","modified":"2016-12-10T00:26:25.000Z","size":34824,"humanSize":"34.01 KB","extension":".cfg","url":"http://10.13.214.241:8080/api/v1/configurations/ios.cfg","history":"http://10.13.214.241:8080/api/v1/history/configurations/ios.cfg","type":"file","mimeType":"application/octet-stream"}],"size":34824,"humanSize":"34.01 KB"}}
ios#
```

#### Get the history

```

ios#$/admin:changeme@10.13.214.241:8080/api/v1/history/configurations/ios.cfg ios.cfg.history
Destination filename [ios.cfg.history]?
Loading http://**************@10.13.214.241:8080/api/v1/history/configurations/ios.cfg
277 bytes copied in 1.244 secs (223 bytes/sec)
ios#more ios.cfg.history
[{"action":"created","size":34824,"humanSize":"34.01 KB","md5":"7c0f5c0733cf766f004bb33470ac87f1","md5ValidationRequested":false,"md5Validated":false,"modified":"2016-12-10T00:26:25.000Z","sourceIP":"10.0.250.4","sourceDNSName":"xxx.yyy.zzz","userData":{}}]
ios#

```

### Load it back to running-config

```
ios#copy http://admin:changeme@10.13.214.241:8080/api/v1/configurations/ios.cfg running-config
Destination filename [running-config]?
Loading http://**************@10.13.214.241:8080/api/v1/configurations/ios.cfg !
34824 bytes copied in 14.016 secs (2485 bytes/sec)
ios#
```

### Security

The server provides 3 levels of security:

1. HTTP-Basic: Each request requires a username/password be submitted.
2. IP Restrictions: Supports specific IP addresses and ranges. White or black list.
3. HTTPS Support: Simply supplying a PEM-encoded key and certificate file will require HTTPS requests

### Tests

Run `npm test`.

```
Routes with authentication enabled. No username/password provided
    /GET / )
      ✓ it should return a 401
    /GET /api/
      ✓ it should return a 401
    /GET /api/v1/
      ✓ it should return a 401
<...>
File.
  GET /api/v1/file.txt (Non-existent file)
    ✓ it should return a 404 (38ms)
  PUT /api/v1/file.txt (Put new file)
    ✓ it should return a 200 (50ms)
  GET /api/v1/file.txt (Get file)
    ✓ it should return a 200 and be text
  GET /api/v1/md5/file.txt (Get file MD5)
    ✓ it should return a 200 and be json
  GET /api/v1/history/file.txt (Get new file history)
    ✓ it should return a 200 and be json
  POST /api/v1/file.txt (Overwrite existing file)
    ✓ it should return a 200
  GET /api/v1/file.txt (Get modified file)
    ✓ it should return a 200 and be text
  GET /api/v1/md5/file.txt (Get modified file MD5)
    ✓ it should return a 200 and be json
  GET /api/v1/history/file.txt (Get modified file history)
    ✓ it should return a 200 and be json
  DELETE /api/v1/history/file.txt (Delete file)
    ✓ it should return a 200 and be json
  GET /api/v1/file.txt (Non-existent file)
    ✓ it should return a 404
  GET /api/v1/history/file.txt (Non-existent history)
    ✓ it should return a 404

```

### Configuration

Configuration management uses [node-config](https://github.com/lorenwest/node-config)

The server uses a default.yaml file to provide the run time configuration.

`config/default.yaml`

Configuration files/environment variables are loaded in the following order. [js-yaml](https://github.com/nodeca/js-yaml) is included as a dependancy so yaml files can be used.

```
default.EXT
default-{instance}.EXT
{deployment}.EXT
{deployment}-{instance}.EXT
{short_hostname}.EXT
{short_hostname}-{instance}.EXT
{short_hostname}-{deployment}.EXT
{short_hostname}-{deployment}-{instance}.EXT
{full_hostname}.EXT
{full_hostname}-{instance}.EXT
{full_hostname}-{deployment}.EXT
{full_hostname}-{deployment}-{instance}.EXT
local.EXT
local-{instance}.EXT
local-{deployment}.EXT
local-{deployment}-{instance}.EXT
(Finally, custom environment variables can override all files)
```

The config file is documented with the necessary values.

### API guide

#### GET

**File (returns the contents of the file)**

GET http://localhost:8080/api/v1/some/dir/file.txt

**Directory (returns a json directory listing)**

GET http://localhost:8080/api/v1/some/dir/

**History (returns the history of a file)**

GET http://localhost:8080/api/v1/history/some/dir/file.txt

**MD5 (return the MD5 hash for a file)**

GET http://localhost:8080/api/v1/md5/some/dir/file.txt

#### POST/PUT (same behavior)

**File (pushes a file to RBFS)**

PUT/POST http://localhost:8080/api/v1/some/dir/file.txt

form fields:
- file: the file
- xxxx:  any userdata to be saved

**Directory (creates a directory)**

PUT/POST http://localhost:8080/api/v1/some/dir/

#### DELETE

**File (also deletes the history)**

DELETE http://localhost:8080/api/v1/some/dir/file.txt

**Directory (removes directories and all contents)**

DELETE http://localhost:8080/api/v1/some/dir/

## Built with great open source software:

- [node.js](https://nodejs.org/en/)
- [express](http://expressjs.com/)
- and many more (see the package.json for dependencies)
