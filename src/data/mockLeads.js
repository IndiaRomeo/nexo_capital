export const PIPELINE_STAGES = [
  { id: 'nuevo', label: 'Nuevo Lead', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { id: 'llamada1', label: 'Llamada 1', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  { id: 'documentos', label: 'Documentos', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  { id: 'llamada2', label: 'Llamada 2', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  { id: 'desembolsado', label: 'Desembolsado', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
]

export const mockLeads = [
  {
    id: 1, nombre: 'María González', telefono: '(555) 234-5678', estado: 'Texas',
    trabajando: 'Sí', tipoTrabajo: 'Tiempo completo', ingresos: '$2,000 – $3,000',
    cuentaActiva: 'Sí', ingresosEnCuenta: 'Sí', banco: 'Chase', tiempoCuenta: 'Más de 6 meses',
    historialCredito: 'Sí', montoNecesario: '$2,000 – $5,000', proposito: 'Reparación del carro',
    stage: 'llamada1', createdAt: '2024-01-15', notas: 'Cliente muy interesado, confirmar documentos',
    fechaNacimiento: '1985-03-12', direccion: '123 Oak St, Houston TX 77001', codigoPostal: '77001',
    estadoCivil: 'Casada', idDoc: null,
  },
  {
    id: 2, nombre: 'Carlos Ramírez', telefono: '(555) 345-6789', estado: 'Florida',
    trabajando: 'Sí', tipoTrabajo: 'Independiente / Self-employed', ingresos: '$3,000 – $5,000',
    cuentaActiva: 'Sí', ingresosEnCuenta: 'Sí', banco: 'Bank of America', tiempoCuenta: 'Más de 6 meses',
    historialCredito: 'Sí', montoNecesario: 'Más de $5,000', proposito: 'Capital de trabajo para negocio',
    stage: 'documentos', createdAt: '2024-01-14', notas: 'Solicita $8,000. Buen perfil.',
    fechaNacimiento: '1979-07-22', direccion: '456 Palm Ave, Miami FL 33101', codigoPostal: '33101',
    estadoCivil: 'Soltero', idDoc: null,
  },
  {
    id: 3, nombre: 'Ana López', telefono: '(555) 456-7890', estado: 'California',
    trabajando: 'Sí', tipoTrabajo: 'Medio tiempo', ingresos: '$2,000 – $3,000',
    cuentaActiva: 'Sí', ingresosEnCuenta: 'No', banco: 'Wells Fargo', tiempoCuenta: '3 a 6 meses',
    historialCredito: 'No', montoNecesario: '$1,000 – $2,000', proposito: 'Gastos médicos familiares',
    stage: 'nuevo', createdAt: '2024-01-16', notas: '',
    fechaNacimiento: '', direccion: '', codigoPostal: '', estadoCivil: '', idDoc: null,
  },
  {
    id: 4, nombre: 'Pedro Martínez', telefono: '(555) 567-8901', estado: 'New York',
    trabajando: 'Sí', tipoTrabajo: 'Tiempo completo', ingresos: '$5,000+',
    cuentaActiva: 'Sí', ingresosEnCuenta: 'Sí', banco: 'Citi', tiempoCuenta: 'Más de 6 meses',
    historialCredito: 'Sí', montoNecesario: 'Más de $5,000', proposito: 'Compra de equipo para negocio',
    stage: 'llamada2', createdAt: '2024-01-12', notas: 'Estrategia crédito: desembolso $500 construcción',
    fechaNacimiento: '1988-11-05', direccion: '789 Broadway, New York NY 10001', codigoPostal: '10001',
    estadoCivil: 'Casado', idDoc: null,
  },
  {
    id: 5, nombre: 'Lucía Hernández', telefono: '(555) 678-9012', estado: 'Illinois',
    trabajando: 'Sí', tipoTrabajo: 'Tiempo completo', ingresos: '$3,000 – $5,000',
    cuentaActiva: 'Sí', ingresosEnCuenta: 'Sí', banco: 'Chase', tiempoCuenta: 'Más de 6 meses',
    historialCredito: 'Sí', montoNecesario: '$2,000 – $5,000', proposito: 'Consolidación de deudas',
    stage: 'desembolsado', createdAt: '2024-01-08', notas: 'Préstamo aprobado: $4,000 / 24 meses',
    fechaNacimiento: '1992-05-18', direccion: '321 Chicago Ave, Chicago IL 60601', codigoPostal: '60601',
    estadoCivil: 'Soltera', idDoc: null,
  },
]
