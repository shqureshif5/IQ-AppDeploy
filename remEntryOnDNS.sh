#!/bin/bash
nsupdate -l -v -D <<EOF
local 127.0.0.1
zone f5.net.
update del $1.f5.net. 
send
quit
EOF

