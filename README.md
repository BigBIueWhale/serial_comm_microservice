# gRPC Serial Communication Microservice

## Components
* executable- Rust microservice server listening on Ipv6 IP+PORT `[::1]:50051` HTTP/2 (because that's the default in gRPC, it's for communicating between servers). Ready to execute any serial API function that the client has in mind.
* client- example usage of the microservice. In our case it's an Electron React TypeScript app and the backend of the app (the `main`) uses the gRPC API.

## WIP
The project is not finished yet:
* It has to be researched how to use gRPC with ts-proto since plain ts-proto only supports protobuf, not a full-blown HTTP/2 client. So far the client-side of the gRPC has not been implemented yet, only the Rust server, the GUI, and the communication between `main` and `renderer` have been implemented so far.
* Implement push notifications from `main` to `renderer` as opposed to the existing implementation in which only `renderer` can initiate an Electron IPC remote procedural call. Don't confuse between Electron IPC (which gives remote procedural call functionality between `renderer` and `main`) and between gRPC which is meant for the communication with the Rust microservice.
* Implement the serial communication itself in the Rust gRPC server- so far the only functionality the gRPC server provides is a CalcTangent function, which is just to test the communication, but doesn't actually provide any serial communication functionality yet.
* Support Windows 10+ operating systems in addition to the currently-supported unix-based OSs. This will involve creating batch files for compiling the Rust app and for unzipping the correct precompiled protoc (Protobuf Compiler) binary and of course providing the precompiled protoc.exe release zip files for Windows 32-bit and 64-bit.

## Client GUI
![Client_GUI_Screenshot](/docs/screenshots/client_screenshot.png)
