# Build the Go API
FROM golang:latest AS backend
ADD ./backend /backend
WORKDIR /backend
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-w" -a -o .

# Build the React application
FROM node:alpine AS frontend
ADD ./frontend /frontend
WORKDIR /frontend
RUN npm install
RUN npm run build

# Final stage build, this will be the container
# that we will deploy to production
FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=backend /backend ./
COPY --from=frontend /frontend ./frontend
RUN chmod +x ./meetneeds
EXPOSE 8080
CMD ./meetneeds
