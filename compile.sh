#!/bin/bash

compile="/usr/local/bin/clientjade -c"

$compile ./templates/index.jade > ./packages/system/public/assets/jade/index.js
