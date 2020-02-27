#!/bin/bash
rm -rf ca.* server.*
openssl genrsa -out server.key 2048
openssl rsa -in server.key -out server.key
openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
openssl req -new -x509 -key server.key -out ca.crt -days 3650 -subj "/C=CN/ST=SHANGHAI/L=SHANGHAI/O=TRANSWARP/OU=SOPHON/CN=${HOSTNAME}"
openssl x509 -req -days 3650 -in server.csr -CA ca.crt -CAkey server.key -CAcreateserial -out server.crt
