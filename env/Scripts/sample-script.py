#!"c:\users\nihal\documents\uni\year 3\csp354 project\source code\env\scripts\python.exe"
# EASY-INSTALL-ENTRY-SCRIPT: 'yfinance==0.1.64','console_scripts','sample'
__requires__ = 'yfinance==0.1.64'
import re
import sys
from pkg_resources import load_entry_point

if __name__ == '__main__':
    sys.argv[0] = re.sub(r'(-script\.pyw?|\.exe)?$', '', sys.argv[0])
    sys.exit(
        load_entry_point('yfinance==0.1.64', 'console_scripts', 'sample')()
    )
