echo "R2K9 is now starting on port $port."

trap 'kill -TERM $PID' TERM INT
python site.py R2K9 $environment &
PID=$!
wait $PID
trap - TERM INT
wait $PID
EXIT_STATUS=$?

echo "R2K9 finishing ..."
