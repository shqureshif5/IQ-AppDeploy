#!/bin/bash
nsupdate -l -v -D <<EOF
local 127.0.0.1
zone f5.net.
update add $1.f5.net. 60 A $2
send
quit
EOF

