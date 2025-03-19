import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, Pagination, Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, Autocomplete } from '@mui/material';
import Page from '../../common/Page';
import ApiRequest from '../../../helpers/axiosInstances';
import ToastAutoHide from '../../common/ToastAutoHide';
import { transformDate } from '../../../helpers/utils';
import * as XLSX from 'xlsx'; // Importa la biblioteca xlsx

const Presupuestos = () => {
    const initialState = { objeto: '', fecha: transformDate(new Date()), vendedor_nombre: '', cliente_nombre: '', monto: '' }; // Eliminado descripción
    const [proyectosList, setProyectosList] = useState([]);
    const [filteredProyectosList, setFilteredProyectosList] = useState([]); // Nuevo estado para la lista filtrada
    const [page, setPage] = useState(0);
    const [body, setBody] = useState(initialState);
    const [openDialog, setOpenDialog] = useState(false);
    const [mensaje, setMensaje] = useState({ ident: null, message: null, type: null });
    const [selectedMonth, setSelectedMonth] = useState(''); // Nuevo estado para el mes seleccionado
    const [vendedores, setVendedores] = useState([]); // Estado para almacenar la lista de vendedores
    const [clientes, setClientes] = useState([]); // Estado para almacenar la lista de clientes
    const tableRef = useRef(null); // Referencia para la tabla oculta

    const handleDialog = () => {
        setOpenDialog(prev => !prev);
    };

    const handlePage = (event, newPage) => {
        setPage(newPage - 1);
    };

    const getProyectos = async () => {
        try {
            const { data } = await ApiRequest().get('/presupuestos');
            setProyectosList(data);
            setFilteredProyectosList(data); // Inicialmente mostrar todos los presupuestos
        } catch (error) {
            console.log(error);
        }
    };

    // Función para obtener la lista de vendedores desde la tabla usuarios
    const getVendedores = async () => {
        try {
            const { data } = await ApiRequest().get('/usuarios'); // Ajusta la ruta según tu API
            setVendedores(data.map(item => ({ nombre: item.user }))); // Mapea la columna 'user' a 'nombre'
        } catch (error) {
            console.log(error);
        }
    };

    // Función para obtener la lista de clientes desde la tabla clientes
    const getClientes = async () => {
        try {
            const { data } = await ApiRequest().get('/clientes'); // Ajusta la ruta según tu API
            setClientes(data.map(item => ({ nombre: item.nombre }))); // Mapea la columna 'nombre' a 'nombre'
        } catch (error) {
            console.log(error);
        }
    };

    const onChange = ({ target: { name, value } }) => {
        setBody({ ...body, [name]: value });
    };

    const submitProyecto = async () => {
        try {
            const { data } = await ApiRequest().post('/presupuestos/guardar', body);
            handleDialog();
            getProyectos();
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
            setBody(initialState);
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            });
        }
    };

    const deleteProyecto = async (id) => {
        try {
            const { data } = await ApiRequest().post('/presupuestos/eliminar', { id: id });
            getProyectos();
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            });
        }
    };

    // Función para mover un presupuesto a ventas
    const moverAVentas = async (id) => {
        try {
            const { data } = await ApiRequest().post('/presupuestos/mover-a-ventas', { id: id });
            getProyectos(); // Actualizar la lista de presupuestos
            setMensaje({
                ident: new Date().getTime(),
                message: data,
                type: 'success'
            });
        } catch ({ response }) {
            setMensaje({
                ident: new Date().getTime(),
                message: response.data,
                type: 'error'
            });
        }
    };

    // Función para exportar a Excel
    const exportToExcel = () => {
        try {
            // Crear un array de arrays con los datos
            const data = [
                // Encabezados
                ["ID", "Objeto", "Fecha", "Vendedor", "Cliente", "Monto"],
                // Datos de los presupuestos
                ...filteredProyectosList.map((item) => [
                    item.id,
                    item.objeto,
                    transformDate(item.fecha), // Formatear la fecha
                    item.vendedor_nombre,
                    item.cliente_nombre,
                    `${item.monto} Bs`, // Agregar la moneda al monto
                ]),
            ];

            // Crear la hoja de cálculo
            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Presupuestos");

            // Aplicar estilos a los encabezados (negrita)
            const headerStyle = { font: { bold: true }, alignment: { horizontal: 'center' } };
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[cellAddress].s) ws[cellAddress].s = {};
                Object.assign(ws[cellAddress].s, headerStyle);
            }

            // Ajustar el ancho de las columnas
            ws['!cols'] = [
                { wch: 10 }, // Ancho de columna para ID
                { wch: 20 }, // Ancho de columna para Objeto
                { wch: 15 }, // Ancho de columna para Fecha
                { wch: 20 }, // Ancho de columna para Vendedor
                { wch: 20 }, // Ancho de columna para Cliente
                { wch: 15 }, // Ancho de columna para Monto
            ];

            // Guardar el archivo
            XLSX.writeFile(wb, "Presupuestos.xlsx");
        } catch (error) {
            console.error("Error al exportar a Excel:", error);
            setMensaje({
                ident: new Date().getTime(),
                message: "Error al exportar a Excel",
                type: 'error'
            });
        }
    };

    // Función para manejar el cambio de mes en el calendario
    const handleMonthChange = (event) => {
        const selectedMonth = event.target.value;
        setSelectedMonth(selectedMonth);

        if (selectedMonth) {
            const filtered = proyectosList.filter(proyecto => {
                const proyectoDate = new Date(proyecto.fecha);
                const proyectoMonth = proyectoDate.getFullYear() + '-' + String(proyectoDate.getMonth() + 1).padStart(2, '0');
                return proyectoMonth === selectedMonth;
            });
            setFilteredProyectosList(filtered);
        } else {
            setFilteredProyectosList(proyectosList);
        }
    };

    // Obtener proyectos, vendedores y clientes al cargar el componente
    useEffect(() => {
        getProyectos();
        getVendedores();
        getClientes();
    }, []);

    return (
        <Page title="SELLER | Presupuestos">
            <ToastAutoHide message={mensaje} />
            <Dialog open={openDialog} onClose={handleDialog} fullWidth>
                <DialogTitle>Nueva venta</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                        <TextField
                            name='objeto'
                            margin='normal'
                            size='small'
                            value={body.objeto}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Objeto'
                            onChange={onChange}
                        />
                        <TextField
                            name='monto'
                            margin='normal'
                            size='small'
                            value={body.monto}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Monto'
                            onChange={onChange}
                        />
                        <TextField
                            name='fecha'
                            margin='normal'
                            size='small'
                            value={body.fecha}
                            color='primary'
                            variant='outlined'
                            fullWidth
                            label='Fecha (YYYY-MM-DD)'
                            onChange={onChange}
                        />
                        {/* Autocomplete para Vendedor */}
                        <Autocomplete
                            options={vendedores}
                            getOptionLabel={(option) => option.nombre} // Usa el campo 'nombre' para mostrar en la lista
                            value={body.vendedor_nombre ? vendedores.find(v => v.nombre === body.vendedor_nombre) || null : null}
                            onChange={(event, newValue) => {
                                setBody({ ...body, vendedor_nombre: newValue ? newValue.nombre : '' });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    name='vendedorNombre'
                                    margin='normal'
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    fullWidth
                                    label='Vendedor'
                                    sx={{ minWidth: '300px' }} // Ajusta el ancho del campo
                                />
                            )}
                            sx={{ width: '100%' }} // Asegura que el Autocomplete ocupe todo el ancho
                        />
                        {/* Autocomplete para Cliente */}
                        <Autocomplete
                            options={clientes}
                            getOptionLabel={(option) => option.nombre} // Usa el campo 'nombre' para mostrar en la lista
                            value={body.cliente_nombre ? clientes.find(c => c.nombre === body.cliente_nombre) || null : null}
                            onChange={(event, newValue) => {
                                setBody({ ...body, cliente_nombre: newValue ? newValue.nombre : '' });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    name='clienteNombre'
                                    margin='normal'
                                    size='small'
                                    color='primary'
                                    variant='outlined'
                                    fullWidth
                                    label='Cliente'
                                    sx={{ minWidth: '300px' }} // Ajusta el ancho del campo
                                />
                            )}
                            sx={{ width: '100%' }} // Asegura que el Autocomplete ocupe todo el ancho
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='secondary' onClick={handleDialog}>Cancelar</Button>
                    <Button variant='contained' color='primary' onClick={submitProyecto}>Añadir presupuesto</Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="lg">
                <Box sx={{ pb: 5 }}>
                    <Typography variant="h5">Lista de Presupuestos</Typography>
                </Box>
                <Grid container spacing={2}>
                    {/* Botones de Añadir presupuesto, Exportar a Excel y Calendario */}
                    <Grid item xs={12} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button variant='contained' color='primary' onClick={handleDialog}>Añadir presupuesto</Button>
                        <Button variant="contained" color="success" onClick={exportToExcel}>Exportar a Excel</Button>
                        <TextField
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            variant="outlined"
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                    {/* Lista de presupuestos */}
                    {filteredProyectosList.slice(page * 10, page * 10 + 10).map((item, index) => (
                        <Grid key={index} item xs={12} sm={4} sx={{ mt: 3 }}>
                            <ProyectosCard
                                id={item.id}
                                imagen="https://i.pinimg.com/originals/9a/e7/3f/9ae73f54f07ea9594ab6c521a61dcdb2.png"
                                objeto={item.objeto}
                                fecha={item.fecha}
                                vendedor_nombre={item.vendedor_nombre}
                                cliente_nombre={item.cliente_nombre}
                                monto={item.monto}
                                actionDelete={() => deleteProyecto(item.id)}
                                actionAprobar={() => moverAVentas(item.id)} // Pasar la función moverAVentas
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        {/* Paginación */}
                        <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
                            <Pagination count={Math.ceil(filteredProyectosList.length / 10)} color="primary" onChange={handlePage} />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
};

const ProyectosCard = ({ id, imagen, objeto, fecha, vendedor_nombre, cliente_nombre, monto, actionDelete, actionAprobar }) => {
    return (
        <Box sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2 }}>
            <img src={imagen} alt="Proyecto" style={{ width: '100%', borderRadius: 8 }} />
            <Typography variant="h6">{objeto}</Typography>
            <Typography variant="body2"><strong>Fecha:</strong> {fecha}</Typography>
            <Typography variant="body2"><strong>Vendedor:</strong> {vendedor_nombre}</Typography>
            <Typography variant="body2"><strong>Cliente:</strong> {cliente_nombre}</Typography>
            <Typography variant="body2"><strong>Monto:</strong> {monto}$</Typography>
            <Button variant="contained" color="secondary" onClick={() => actionDelete(id)}>Eliminar</Button>
            <Button variant="contained" color="success" onClick={() => actionAprobar(id)} sx={{ ml: 2 }}>Aprobar</Button>
        </Box>
    );
};

export default Presupuestos;