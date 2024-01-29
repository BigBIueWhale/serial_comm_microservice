# gRPC Serial Communication Microservice

## Rationale
serialport NodeJS library seems good, but the support for Electron apps, specifically ones that run in Raspbian on Raspberry Pi 4, is questionable.

In other words: serialport library is buggy when using with Electron (at least from my experience), and accessing serial communication really shouldn't be that complicated: it's a native functionality in any desktop operating system, a Rust program can do it without complaining!

My idea was: let's just do it in Rust, and call the Rust functions via the `main` electron process!

In order to call functions cross programming language, you need a way to serialize / deserialize the types, and generate types for each of the involved programing languages.

Protobuf can be used for that, and gRPC is based on protobuf.

The .proto file defines the API and protoc (Protobuf Compiler) then generates type definitions for both Rust and TypeScript. Very convenient!

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
