#!/bin/bash

compile="$(which clientjade) -c"

$compile ./templates/index.jade > ./packages/system/public/assets/jade/index.js
