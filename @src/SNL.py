#! /usr/bin/env python3
r"""Standard Nick Logger module made for quick logging and troubleshooting Python programs by Nicolas Mendes.
"""

# 🧶 Modules Imports
import pathlib, os, time, json, platform
from pathlib import Path
from colorama import Fore

""" Made by Nicolas Mendes - Feb 2021
SUMMARY:
🧶 Modules Imports
✍️ Initial Setup to load assets
🔖 Main class
⚙️ Logic and Defs
=========== ✍️ Module controller
=========== 📖 Main log function
"""

__copyright__ = """
    Standard Nick Logger (SNL) - Copyright (c) 2021-2024, Nicolas Mendes; mailto:nicolasmendes_developer@outlook.com
    Permission to use, copy, modify, and distribute this software and its
    documentation for any purpose and without fee or royalty is hereby granted,
    provided that the above copyright notice appear in all copies and that
    both that copyright notice and this permission notice appear in
    supporting documentation or portions thereof, including modifications,
    that you make.
"""
__SNL_version__ = "v1.1.2"
program_version = ""

# ✍️ Initial Setup to load assets

OUTPUT_PATH = pathlib.Path(__file__).parent.absolute()
LOGS_PATH = OUTPUT_PATH / Path("./Resources/logs")
VERSION_PATH = OUTPUT_PATH / Path("./Resources/tmp/verinfo.bin")
VERSION_PATH_RAW = OUTPUT_PATH / Path("./Resources")


def relative_to_ver(path: str) -> Path:
    """Return a path relative to the logs folder."""
    return VERSION_PATH_RAW / Path(path)


def relative_to_logs(path: str) -> Path:
    """Return a path relative to the logs folder."""
    return LOGS_PATH / Path(path)


# check if logs folder exists, if not, create it.
if not LOGS_PATH.exists():
    LOGS_PATH.mkdir()

# Create a file inside logs called 'verinfo.bin' with '{"currentVersion": f"{program_version}"}' inside.
if not VERSION_PATH.exists():
    with open(f"{VERSION_PATH}", "w+") as version_file:
        version_file.write(json.dumps({"currentVersion": f"PLACEHOLDER"}))
        version_file.close()

log_routine_switch = None
debug_mode = None
file_log_name = None
max_lines_allowed = None
Pid = None
get_timestamp = None
OS_Detector = None
current_time = time.strftime("%m-%d-%Y -> %H:%M:%S")


# 🔖 Main class
class nick_logger:
    """Logger class to be imported as a simple object"""

    # ⚙️ Logic and Defs

    # ✍️ Module controller

    def log_routine_controller(
        debug_Mode_C: bool = True,
        log_routine_C: bool = True,
        file_name: str = "logs",
        max_lines: int = 1000,
        show_pid: bool = True,
        show_timestamp: bool = True,
        track_platform: bool = True,
        program_version: str = "",
    ):
        """Control Log Routine main function. Defaults: debug_Mode_C = True, log_routine_C = True, file_name = 'logs', max_lines = 1000, show_pid = True, show_timestamp = True, track_platform = True, program_version : String -> Needs to be defined manually"""
        global log_routine_switch
        global debug_mode
        global file_log_name
        global max_lines_allowed
        global Pid
        global get_timestamp
        global OS_Detector
        global program_ver

        log_routine_switch = log_routine_C
        debug_mode = debug_Mode_C
        file_log_name = file_name
        max_lines_allowed = max_lines
        program_ver = program_version

        with open(f"{VERSION_PATH}", "w+") as version_file:
            version_file.write(json.dumps({"currentVersion": f"{program_ver}"}))
            version_file.close()

        if show_pid:
            Pid = os.getpid()
        else:
            Pid = ""

        if show_timestamp:
            get_timestamp = time.time()
        else:
            get_timestamp = ""

        if track_platform:
            OS_Detector = platform.system()
        else:
            OS_Detector = ""

    def log_os_details(
        log_message: str = f"\n\n[OK] ===> Python loaded on {OS_Detector}. Starting new instance at PID: {Pid} | UTS: {get_timestamp}\n",
    ):
        """Logs OS details"""

        if Pid != "" and get_timestamp != "" and OS_Detector != "":
            os_log_det = f"\n\n[OK] ===> Python loaded on {OS_Detector}. Starting new instance at PID: {Pid} | UTS: {get_timestamp}\n"
            return os_log_det

    def show_ver():
        """Show program version"""
        with open(f"{VERSION_PATH}", "r+") as version_file:
            version_data = json.load(version_file)
            current_version = version_data["currentVersion"]
            return current_version

    # 📖 Main log function
    def log_routine(
        log: str,
        time_needed: bool = True,
        hide_pid: bool = True,
        show_default_label: bool = True,
        custom_label: str = "",
        is_success: bool = False,
        is_warnings: bool = False,
        is_error: bool = False,
        is_default_log: bool = True,
    ):
        """Write strings to the log file and if debug is enabled, print it to console. ARGS: log, time_needed = True"""

        global current_time

        if time_needed is None:
            time_needed = True

        log_header = f"""{nick_logger.show_ver()}
===================================================
                  Standard Nick Logger
            LOG FILE MADE FOR DEBUG PURPOSES
        made by Nicolas Mendes - September 2021
===================================================\n
"""

        # Check if "{file_log_name}.log" exists, if not create this file.
        if not os.path.exists(relative_to_logs(f"{file_log_name}.log")):
            open(f"{relative_to_logs(f'{file_log_name}.log')}", "w+")
            # append log_header to the file.
            with open(f"{relative_to_logs(f'{file_log_name}.log')}", "a") as log_file:
                log_file.write(log_header)
                log_file.close()

        # if the first line of {file_log_name}.log is different from current_version
        with open(f"{relative_to_logs(f'{file_log_name}.log')}") as check_ver:
            first_line_ver = check_ver.readline().rstrip()
            if first_line_ver != nick_logger.show_ver():
                if first_line_ver == "" or first_line_ver == " ":
                    with open(
                        f"{relative_to_logs(f'{file_log_name}.log')}", "w+"
                    ) as log_file:
                        log_file.write(log_header)
                        log_file.write(
                            "\n\n[NOTICE] Log file has been deleted or cleaned.\n"
                        )
                        log_file.close()
                else:
                    # Delete everything inside the file and append log_header.
                    with open(
                        f"{relative_to_logs(f'{file_log_name}.log')}", "w+"
                    ) as log_file:
                        log_file.write(log_header)
                        log_file.write(
                            f"\n\n[NOTICE] PROGRAM HAS BEEN UPDATED TO {nick_logger.show_ver()}!\n"
                        )
                        log_file.close()

        # if the file exceeds X lines, delete everything and append log_header to the file.
        with open(f"{relative_to_logs(f'{file_log_name}.log')}", "r") as log_file:
            if len(log_file.readlines()) > max_lines_allowed:
                with open(
                    f"{relative_to_logs(f'{file_log_name}.log')}", "w"
                ) as log_file:
                    log_file.write(log_header)

        if log_routine_switch == True:
            # Append the log to the file.
            if time_needed == True and (Pid != "") and (hide_pid == False):
                with open(
                    f"{relative_to_logs(f'{file_log_name}.log')}", "a"
                ) as log_file:
                    log_file.write(f"{current_time} | PID {Pid} - {log}\n")
            elif (time_needed == True) and (hide_pid == True):
                with open(
                    f"{relative_to_logs(f'{file_log_name}.log')}", "a"
                ) as log_file:
                    log_file.write(f"{current_time} - {log}\n")
            else:
                with open(
                    f"{relative_to_logs(f'{file_log_name}.log')}", "a"
                ) as log_file:
                    log_file.write(f"{log}\n")

        if debug_mode == True:
            if (
                is_default_log == True
                and is_warnings == False
                and is_error == False
                and is_success == False
            ):
                if show_default_label:
                    report_message = "UPDATE: "
                else:
                    report_message = f"{custom_label} "

                return print(f"{Fore.CYAN}{report_message}" + f"{Fore.WHITE}{log}")
            if (
                is_default_log == False
                and is_warnings == True
                and is_error == False
                and is_success == False
            ):
                if show_default_label:
                    report_message = "WARNING: "
                else:
                    report_message = f"{custom_label} "

                return print(f"{Fore.YELLOW}{report_message}" + f"{Fore.WHITE}{log}")
            if (
                is_default_log == False
                and is_warnings == False
                and is_error == True
                and is_success == False
            ):
                if show_default_label:
                    report_message = "FAULT: "
                else:
                    report_message = f"{custom_label} "

                return print(f"{Fore.RED}{report_message}" + f"{Fore.WHITE}{log}")
            if (
                is_default_log == False
                and is_warnings == False
                and is_error == False
                and is_success == True
            ):
                if show_default_label:
                    report_message = "SUCCESS: "
                else:
                    report_message = f"{custom_label} "

                return print(f"{Fore.GREEN}{report_message}" + f"{Fore.WHITE}{log}")


if __name__ == "__main__":
    print(__copyright__)
    exit(0)
