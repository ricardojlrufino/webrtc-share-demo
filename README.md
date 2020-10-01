 ## WebRTC ShareScreen Demo

Demo and testing application with ONE-TO-MANY screen sharing using WebRTC

![print1](docs/print1.png)

The application consists of two modules:

### App-UI

- Developed in React and using RTCMultiConnection

### Server:

- Node.JS + Socket.IO server - Signaling server 


## Features 

 - Screen sharing support
 - Multiple room support
 - Approved Screen Sharing request.
 - Enter the conference via the share link
 - View active participants (needs to improve)

*This project is not a production version*

## Running 

```bash
# Start UI (port 3000)
cd app-ui
npm start

# Start Server (port 9001)
cd server 
npm start
```

TIP: Testing in other PC using HTTPS

```bash
npm install -g localtunnel
lt --port 8000
```
### Docker

You can generate a "production" version using:

```bash
docker build --tag="webrtcdemo" .
docker run -p 9001:9001 --rm --name teste webrtcdemo:latest
```

**Kubernetes **(you need deploy image to a public server):

```bash
kubectl create -f kubernets-deployment.yaml
```

## License

This project is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) Ricardo JL Rufino.