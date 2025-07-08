#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to find an available terminal emulator
find_terminal() {
    for term in gnome-terminal konsole xfce4-terminal xterm lxterminal mate-terminal terminator; do
        if command -v $term >/dev/null 2>&1; then
            echo $term
            return
        fi
    done
    echo ""
}

TERMINAL=$(find_terminal)

if [ -n "$TERMINAL" ]; then
    # Start backend server in a new terminal window
    case $TERMINAL in
        gnome-terminal)
            $TERMINAL --title="Backend" -- bash -c "cd '$SCRIPT_DIR' && python api_server.py; exec bash" &
            $TERMINAL --title="Frontend" -- bash -c "cd '$SCRIPT_DIR/frontend' && npm run dev; exec bash" &
            ;;
        konsole)
            $TERMINAL --new-tab -p tabtitle=Backend -e bash -c "cd '$SCRIPT_DIR' && python api_server.py; exec bash" &
            $TERMINAL --new-tab -p tabtitle=Frontend -e bash -c "cd '$SCRIPT_DIR/frontend' && npm run dev; exec bash" &
            ;;
        xfce4-terminal|lxterminal|mate-terminal|terminator)
            $TERMINAL --title="Backend" -e bash -c "cd '$SCRIPT_DIR' && python api_server.py; exec bash" &
            $TERMINAL --title="Frontend" -e bash -c "cd '$SCRIPT_DIR/frontend' && npm run dev; exec bash" &
            ;;
        xterm)
            $TERMINAL -T "Backend" -e "cd '$SCRIPT_DIR' && python api_server.py; exec bash" &
            $TERMINAL -T "Frontend" -e "cd '$SCRIPT_DIR/frontend' && npm run dev; exec bash" &
            ;;
        *)
            echo "Unsupported terminal: $TERMINAL"
            exit 1
            ;;
    esac
    # Wait a few seconds to allow frontend to start
    sleep 5
    # Open the frontend UI in the default browser
    xdg-open http://localhost:3000
elif command -v tmux >/dev/null 2>&1; then
    # Use tmux as a fallback
    tmux new-session -d -s servers
    tmux split-window -h -t servers
    tmux send-keys -t servers:0.0 "cd '$SCRIPT_DIR' && python api_server.py" C-m
    tmux send-keys -t servers:0.1 "cd '$SCRIPT_DIR/frontend' && npm run dev" C-m
    sleep 5
    xdg-open http://localhost:3000
    tmux attach-session -t servers
else
    echo "No supported terminal emulator or tmux found. Please install one to use this script."
    exit 1
fi 