# Client
Simple Electron React TypeScript based on Electron React Boilerplate. See `client/.git.readme/remote.txt`

## Principal
Used as the gRPC client to test the Rust microservice

Electron project has 2 folders: `main` and `renderer`. main is the Node.JS backend, and it also the gRPC client of the Rust microservice.

## Customization
A few things are customized compared to the default Electron React Boilerplate repo:
* `shared` folder with infrastructure for statically typed communication between `main` and renderer via Inter Process Communication. This includes: Remote Procedural Calls initiated by `renderer` to call a function in `main` (`client/src/shared/src/ipc/clientToServer.ts`), and push notifications initiated by `main` to trigger anyone listening in `renderer` (`client/src/shared/src/ipc/serverToClient.ts`)
* A couple important Inter Process Communication functions exposed in `client/src/main/preload.ts` for access in the renderer
* Custom Material UI (@mui) based GUI- serial communications GUI for connecting to serial port, choosing baud rate etc
* Toast implementation for pop-up messages to show user
* Main server application handled in one main class `client/src/main/src/MyApp.ts`, that is instantiated, initialized, and cleaned up in `client/src/main/main.ts`
* [PLAN]- Use ts-proto from npm and use protoc precompiled executable from GitHub to generate typescript classes from the protobuf file, and make `main` a gRPC client.
