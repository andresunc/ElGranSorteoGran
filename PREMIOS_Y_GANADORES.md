# Guía para Gestionar Premios y Ganadores

## ⚡ IMPORTANTE: Datos Automáticos

La aplicación ahora obtiene **automáticamente** los premios y ganadores desde la API:
- **URL de Premios**: `https://test.bizuit.com/agarciaBIZUITDashboardAPI/api/RestFunction/GetDataPremios`
- **Actualización**: Cada 60 segundos
- **Datos incluidos**: Nombre del sorteo, fecha, modalidad, premios, ganadores

## Datos que se muestran automáticamente

### Información del Sorteo
- **Nombre**: Se obtiene del campo `<NombreSorteo>`
- **Fecha**: Del campo `<FechaSorteo>` 
- **Modalidad**: Del campo `<Modalidad>`
- **Estado**: Del campo `<Sorteado>` (true/false)
- **Link**: Del campo `<LinkSorteo>`

### Premios
- **ID**: `<id>`
- **Título**: `<Titulo>` 
- **Descripción**: `<Descripcion>`
- **Imagen**: `<ImagenURL>`

### Ganadores
- **Número ganador**: `<NumeroGanador>`
- **ID del premio**: `<idPremio>`
- **Nombre**: `<NombreGanador>`
- **Apellido**: `<ApellidoGanador>`

## Cómo Editar Manualmente (SOLO SI ES NECESARIO)

Si necesitas editar manualmente, ve al archivo:
`src/app/components/prizes-modal/prizes-modal.component.ts`

### Estructura de un Premio

```typescript
{
  id: number,           // ID único del premio
  titulo: string,       // Título del premio (ej: "🥇 PRIMER PREMIO")
  descripcion: string,  // Descripción del premio
  imagen: string        // Ruta a la imagen del premio
}
```

### Ejemplo de Edición

```typescript
premios: Premio[] = [
  {
    id: 1,
    titulo: '🥇 PRIMER PREMIO',
    descripcion: 'Auto 0KM Toyota Corolla',
    imagen: 'assets/images/auto.jpg'
  },
  {
    id: 2,
    titulo: '🥈 SEGUNDO PREMIO', 
    descripcion: 'Moto Honda Wave 110cc',
    imagen: 'assets/images/moto.jpg'
  },
  {
    id: 3,
    titulo: '🥉 TERCER PREMIO',
    descripcion: 'Smart TV 55" Samsung',
    imagen: 'assets/images/tv.jpg'
  }
];
```

## Cómo Mostrar los Ganadores

Cuando el sorteo esté listo, edita el mismo archivo y:

### 1. Cambiar el estado del sorteo

```typescript
sorteoRealizado = true; // Cambiar de false a true
```

### 2. Agregar los ganadores

```typescript
ganadores: Ganador[] = [
  {
    numeroGanador: 1234,
    premio: this.premios[0], // Primer premio
    nombre: 'Juan Pérez',    // Opcional
    fechaSorteo: new Date()  // Opcional
  },
  {
    numeroGanador: 5678,
    premio: this.premios[1], // Segundo premio
    nombre: 'María García',
    fechaSorteo: new Date()
  },
  {
    numeroGanador: 9012,
    premio: this.premios[2], // Tercer premio
    nombre: 'Carlos López',
    fechaSorteo: new Date()
  }
];
```

## Cómo Agregar Imágenes

1. Coloca las imágenes en la carpeta: `src/assets/images/`
2. Usa el formato de ruta: `'assets/images/nombre-imagen.jpg'`
3. Formatos soportados: JPG, PNG, WEBP, SVG

### Recomendaciones para las Imágenes

- **Tamaño recomendado**: 400x300 píxeles
- **Formato**: JPG o PNG
- **Peso máximo**: 500KB por imagen
- **Nombres**: usa nombres descriptivos (ej: `auto-toyota.jpg`, `moto-honda.png`)

## Ejemplo Completo

```typescript
export class PrizesModalComponent implements OnInit {
  premios: Premio[] = [
    {
      id: 1,
      titulo: '🚗 GRAN PREMIO',
      descripcion: 'Chevrolet Onix 1.2 0KM',
      imagen: 'assets/images/chevrolet-onix.jpg'
    },
    {
      id: 2,
      titulo: '🏍️ SEGUNDO PREMIO',
      descripcion: 'Yamaha FZ25 250cc',
      imagen: 'assets/images/yamaha-fz25.jpg'
    },
    {
      id: 3,
      titulo: '📱 TERCER PREMIO',
      descripcion: 'iPhone 15 Pro Max',
      imagen: 'assets/images/iphone15.jpg'
    }
  ];

  // Cuando el sorteo esté listo:
  sorteoRealizado = true;
  
  ganadores: Ganador[] = [
    {
      numeroGanador: 777,
      premio: this.premios[0],
      nombre: 'Ana Martínez',
      fechaSorteo: new Date('2024-12-25T20:00:00')
    },
    {
      numeroGanador: 1555,
      premio: this.premios[1],
      nombre: 'Roberto Silva',
      fechaSorteo: new Date('2024-12-25T20:05:00')
    },
    {
      numeroGanador: 3333,
      premio: this.premios[2],
      nombre: 'Laura Fernández',
      fechaSorteo: new Date('2024-12-25T20:10:00')
    }
  ];
}
```

## Notas Importantes

1. **Números de ganadores**: Asegúrate de que los números ganadores existan en el rango de números del sorteo
2. **Orden de premios**: El primer elemento del array `premios` corresponde al premio más importante
3. **Fechas**: Usa el formato `new Date()` para la fecha actual o `new Date('YYYY-MM-DDTHH:mm:ss')` para una fecha específica
4. **Nombres opcionales**: Los campos `nombre` y `fechaSorteo` son opcionales
5. **Recarga**: Después de editar el archivo, la aplicación se recargará automáticamente si está en modo desarrollo

## Visualización

- **Antes del sorteo**: Se muestra "Sorteo Pendiente" con un mensaje informativo
- **Después del sorteo**: Se muestran las tarjetas de ganadores con sus números, premios y datos
- **Fallback de imágenes**: Si una imagen no se encuentra, se mostrará un placeholder automáticamente

¡Listo! Con estos cambios podrás gestionar completamente los premios y ganadores del sorteo.