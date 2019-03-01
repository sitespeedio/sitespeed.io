while true; do
    if ps -ef | grep driver | grep use-mock-keychain > /dev/null
    then
        PROCESS_PID=$(ps -ef | grep driver | grep use-mock-keychain | awk '{print $2}')
        echo "Running"
        echo $PROCESS_PID
        cpulimit -p $PROCESS_PID -l $1
    fi
    sleep 1
done