#!/bin/bash

compile="$(which clientjade) -c"

$compile ./templates/index.jade > ./packages/system/public/assets/jade/index.js
$compile ./templates/lender.jade > ./packages/system/public/assets/jade/lender.js
$compile ./templates/borrower.jade > ./packages/system/public/assets/jade/borrower.js
