#!/bin/bash
# IMPORTANT: use bash to run this script

tasks='
send_message
'
#PHP=/usr/local/bin/php
PHP=/usr/local/services/php-5.5.13/bin/php
#APPPATH=/data/www/yaf/WeLife
APPPATH=/home/baihongye/branches/yaf/WeLife
SCRIPT=${APPPATH}/backend/task.php
LOGPATH=${APPPATH}/logs/message_queue
JOB=MessageQueueJob

# 检查进程是否存在
started=0
function check_process() {

    local task=$1
    local PARAM="-n ${JOB} -t ${task}"
    local MAINFILE=${LOGPATH}/main.${task}.pid

    if [ -e ${MAINFILE} ]; then
        ps aux|grep ${PHP}|grep "${SCRIPT} ${PARAM}$" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            pid=$(cat ${MAINFILE})
            started=1
        else
            echo "main.${task}.pid detected but process does not exist, remove main.${task}.pid"
            rm ${MAINFILE} > /dev/null 2>&1
            started=0
        fi
    else
        started=0
    fi
}

function start_process() {

    local task=$1
    local PARAM="-n ${JOB} -t ${task}"
    local MAINFILE=${LOGPATH}/main.${task}.pid

    if [ ${started} -eq 0 ]; then
        echo "starting..."
        $PHP $SCRIPT $PARAM > /dev/null 2>&1 &
        echo $PHP $SCRIPT $PARAM;
        sleep 1
        ps aux|grep ${PHP}|grep "${SCRIPT} ${PARAM}$" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            sleep 1
            pid=$(cat ${MAINFILE})
            echo "started. PID: $pid"
        else
            echo "param error: task [$task] does not exist"
            exit 1
        fi
    else
        pid=$(cat ${MAINFILE})
        echo "running... PID: $pid"
    fi
}

function stop_process() {

    local task=$1
    local PARAM="-n ${JOB} -t ${task}"

    if [ ${started} -eq 0 ]; then
        echo "task is not running"
    else
        echo "shutting down... PID: $pid"
        kill -s SIGTERM $pid
        while [ $(ps aux|grep ${PHP}|grep "${SCRIPT} ${PARAM}$"|wc -l) -gt 0 ]; do
            sleep 1
        done
        echo "stop."
        started=0
    fi
}

function restart_process() {

    local task=$1
    stop_process $task
    check_process $task
    start_process $task
}

function main() {

    local task=$1
    check_process $task
    echo
    echo "task [$task]:"
    case $command in
        "start")
            start_process $task
            ;;
        "stop")
            stop_process $task
            ;;
        "restart")
            restart_process $task
            ;;
        *)
            usage
            exit 1
            ;;
    esac
    echo
}

function usage() {
    echo "
USAGE:
  $0 [command] [task]
  (DO NOT use sh to run this script)

  Both [command] and [task] parameters are required.

    [command] can be any one of following commands:
    1. start   start queue task
    2. stop    stop queue task
    3. restart restart queue task

    [task] task name of a queue task
    To start/stop/restart all the queue tasks, use 'all' instead a task name

    Task list:"
    for task in $tasks; do
        echo "      $task"
    done
    echo "
EXAMPLE:
  $0 start send_message (Start send_message queue service)
  $0 stop all (Stop all running queue services)
"
}

if [ "$#" -ne 2 ]; then
    usage
    exit 1
fi

command=$1
task=$2

if [ "$task" = 'all' ]; then
    for task in $tasks; do
        main $task
    done
else
    main $task
fi

exit 0
