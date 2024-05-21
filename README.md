# Flight Path Planner

An Electron application built with React and TypeScript for planning flight paths.

## Project Setup

### Prerequisites

Ensure you have Node.js and npm installed. If not, you can download and install them from [Node.js official website](https://nodejs.org/).

### Installation

To install the project dependencies, run:

```bash
$ npm install
```

### Development

To start the development server with live reloading, run:

```bash
$ npm run dev
```

The app will automatically start, or you can use a browser with url: http://localhost:5173/

### Build

To build the application for different operating systems, use the following commands:

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

For web build use:

```bash
$ npm run build
```

## Features

- **Interactive Flight Path Planning**: Plan and visualize flight paths interactively.
- **Unit Support**: Supports multiple units of measurement.
- **Detailed Route Information**: Get azimuths, distances, and turn angles for each segment.
- **Editable Segments**: Edit and customize flight segments.

## Technologies Used

- **Electron**: For building cross-platform desktop apps.
- **React**: For building the user interface.
- **TypeScript**: For type safety and enhanced code quality.
- **OpenLayers**: For interactive map functionalities.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
