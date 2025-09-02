# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 19 application called "El Gran Sorteo Gran" - a raffle/lottery web application. The project uses Angular's standalone components architecture with modern Angular practices.

## Development Commands

### Running the application
- `npm start` or `ng serve` - Start development server at http://localhost:4200/
- `ng build` - Build the project for production (outputs to `dist/`)
- `ng build --watch --configuration development` - Build in watch mode for development

### Testing
- `npm test` or `ng test` - Run unit tests with Karma and Jasmine
- No e2e testing framework is currently configured

### Code Generation
- `ng generate component component-name` - Generate new Angular component
- `ng generate --help` - See all available schematics

## Architecture

### Project Structure
- **src/main.ts**: Application bootstrap using standalone components
- **src/app/app.component.ts**: Root component with RouterOutlet
- **src/app/app.config.ts**: Application configuration with providers
- **src/app/app.routes.ts**: Routing configuration (currently empty)
- **src/styles.css**: Global styles
- **public/**: Static assets

### Key Configuration
- Uses Angular's new standalone components (no NgModules)
- Bootstrap via `bootstrapApplication()` in main.ts
- Router configured with `provideRouter(routes)`
- Zone change detection with event coalescing enabled
- TypeScript 5.6.2
- Modern Angular CLI build system

### Build Configuration
- Development build: No optimization, source maps enabled
- Production build: Full optimization, output hashing
- Bundle size limits: 500kB warning, 1MB error for initial bundle
- Component styles: 4kB warning, 8kB error

## Testing Framework
Uses Karma + Jasmine for unit testing with coverage reporting enabled.