@echo off
setlocal
set JAVA_HOME=C:\Program Files\Pylo\MCreator\jdk
set PATH=%JAVA_HOME%\bin;%PATH%

java -jar "%~dp0gradle\wrapper\gradle-wrapper.jar" %*
