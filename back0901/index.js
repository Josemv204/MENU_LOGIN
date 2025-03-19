const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const figlet = require('figlet')
const asciify = require('asciify-image')
const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '10mb' }))

const credentials = {
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'base_de_datos'
}

app.get('/', (req, res) => {
	res.send('Hola, soy el servidor!')
})

app.post('/api/login', (req, res) => {
	const { username, password } = req.body
	const values = [username, password]
	var connection = mysql.createConnection(credentials)
	connection.query("SELECT * FROM login WHERE username = ? AND password = ?", values, (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			if (result.length > 0) {
				res.status(200).send({
					"id": result[0].id,
					"user": result[0].user,
					"username": result[0].username,
					"picture": result[0].picture,
					"isAuth": true
				})
			} else {
				res.status(400).send('Usuario no existe')
			}
		}
	})
	connection.end()
})

app.get('/api/usuarios', (req, res) => {
	var connection = mysql.createConnection(credentials)
	connection.query('SELECT * FROM login', (err, rows) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send(rows)
		}
	})
})

app.post('/api/eliminar', (req, res) => {
	const { id } = req.body
	var connection = mysql.createConnection(credentials)
	connection.query('DELETE FROM login WHERE id = ?', id, (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "Usuario Eliminado" })
		}
	})
	connection.end()
})

app.post('/api/guardar', (req, res) => {
	const { avatar, user, username, password } = req.body
	const params = [[avatar, user, username, password]]
	var connection = mysql.createConnection(credentials)
	connection.query('INSERT INTO login (avatar, user, username, password) VALUES ?', [params], (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "Usuario creado" })
		}
	})
	connection.end()
})

app.post('/api/editar', (req, res) => {
	const { id, avatar, user, username, password } = req.body
	const params = [avatar, user, username, password, id]
	var connection = mysql.createConnection(credentials)
	connection.query('UPDATE login set avatar = ?, user = ?, username = ?, password = ? WHERE id = ?', params, (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "USuario editado" })
		}
	})
	connection.end()
})

//--------------||PROYECTOS||-------------------
app.get('/api/proyectos', (req, res) => {
    var connection = mysql.createConnection(credentials);
    connection.query(`
        SELECT v.id, v.fecha, v.monto, v.objeto, 
               l.user AS vendedor_nombre, 
               c.nombre AS cliente_nombre 
        FROM ventas v 
        JOIN login l ON v.vendedor_id = l.id 
        JOIN clientes c ON v.cliente_id = c.id;
    `, (err, rows) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.status(200).send(rows);
        }
        connection.end();
    });
});


app.post('/api/proyectos/guardar', (req, res) => {
    const { fecha, vendedorNombre, clienteNombre, monto, objeto } = req.body;
    
    // Establecer la conexión a la base de datos
    var connection = mysql.createConnection(credentials);
    
    // Buscar el ID del vendedor en la tabla login
    connection.query('SELECT id FROM login WHERE user = ?', [vendedorNombre], (err, vendedorResult) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
            connection.end();
            return;
        }
        
        if (vendedorResult.length === 0) {
            res.status(404).send("Vendedor no encontrado");
            connection.end();
            return;
        }
        
        const vendedorId = vendedorResult[0].id;
        
        // Buscar el ID del cliente en la tabla clientes
        connection.query('SELECT id FROM clientes WHERE nombre = ?', [clienteNombre], (err, clienteResult) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
                connection.end();
                return;
            }

            if (clienteResult.length === 0) {
                res.status(404).send("Cliente no encontrado");
                connection.end();
                return;
            }

            const clienteId = clienteResult[0].id;

            // Insertar en la tabla ventas
            const cuerpo = [[fecha, monto, objeto, vendedorId, clienteId]];

            connection.query('INSERT INTO ventas (fecha, monto, objeto, vendedor_id, cliente_id) VALUES ?', [cuerpo], (err, result) => {
                if (err) {
                    res.status(500).send(err.sqlMessage);
                } else {
                    res.status(200).send("Venta agregada");
                }
                connection.end();
            });
        });
    });
});

// Ruta para eliminar un proyecto
app.post('/api/proyectos/eliminar', (req, res) => {
    const { id } = req.body;
    const connection = mysql.createConnection(credentials);

    // Consulta SQL para eliminar un registro
    connection.query('DELETE FROM ventas WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else if (result.affectedRows === 0) {
            res.status(404).send('Registro no encontrado');
        } else {
            res.status(200).send('Registro eliminado con éxito');
        }
        connection.end();
    });
});

//--------------||PRESOPUESTOS||-------------------
app.get('/api/presupuestos', (req, res) => {
    var connection = mysql.createConnection(credentials);
    connection.query(`
        SELECT v.id, v.fecha, v.monto, v.objeto, 
               l.user AS vendedor_nombre, 
               c.nombre AS cliente_nombre 
        FROM presupuestos v 
        JOIN login l ON v.vendedor_id = l.id 
        JOIN clientes c ON v.cliente_id = c.id;
    `, (err, rows) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.status(200).send(rows);
        }
        connection.end();
    });
});


app.post('/api/presupuestos/guardar', (req, res) => {
    const { fecha, vendedorNombre, clienteNombre, monto, objeto } = req.body;
    
    // Establecer la conexión a la base de datos
    var connection = mysql.createConnection(credentials);
    
    // Buscar el ID del vendedor en la tabla login
    connection.query('SELECT id FROM login WHERE user = ?', [vendedorNombre], (err, vendedorResult) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
            connection.end();
            return;
        }
        
        if (vendedorResult.length === 0) {
            res.status(404).send("Vendedor no encontrado");
            connection.end();
            return;
        }
        
        const vendedorId = vendedorResult[0].id;
        
        // Buscar el ID del cliente en la tabla clientes
        connection.query('SELECT id FROM clientes WHERE nombre = ?', [clienteNombre], (err, clienteResult) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
                connection.end();
                return;
            }

            if (clienteResult.length === 0) {
                res.status(404).send("Cliente no encontrado");
                connection.end();
                return;
            }

            const clienteId = clienteResult[0].id;

            // Insertar en la tabla ventas
            const cuerpo = [[fecha, monto, objeto, vendedorId, clienteId]];

            connection.query('INSERT INTO presupuestos (fecha, monto, objeto, vendedor_id, cliente_id) VALUES ?', [cuerpo], (err, result) => {
                if (err) {
                    res.status(500).send(err.sqlMessage);
                } else {
                    res.status(200).send("Presupuestos agregada");
                }
                connection.end();
            });
        });
    });
});

// Ruta para eliminar un presupuesto
app.post('/api/presupuestos/eliminar', (req, res) => {
    const { id } = req.body;
    const connection = mysql.createConnection(credentials);

    // Consulta SQL para eliminar un registro
    connection.query('DELETE FROM presupuestos WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else if (result.affectedRows === 0) {
            res.status(404).send('Registro no encontrado');
        } else {
            res.status(200).send('Registro eliminado con éxito');
        }
        connection.end();
    });
});

// Ruta para mover un presupuesto a ventas
app.post('/api/presupuestos/mover-a-ventas', (req, res) => {
    const { id } = req.body;
    const connection = mysql.createConnection(credentials);

    // Primero, obtener los datos del presupuesto
    connection.query('SELECT * FROM presupuestos WHERE id = ?', [id], (err, presupuestoResult) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
            connection.end();
            return;
        }

        if (presupuestoResult.length === 0) {
            res.status(404).send('Presupuesto no encontrado');
            connection.end();
            return;
        }

        const presupuesto = presupuestoResult[0];

        // Insertar el presupuesto en la tabla de ventas
        const { fecha, monto, objeto, vendedor_id, cliente_id } = presupuesto;
        const cuerpo = [[fecha, monto, objeto, vendedor_id, cliente_id]];

        connection.query('INSERT INTO ventas (fecha, monto, objeto, vendedor_id, cliente_id) VALUES ?', [cuerpo], (err, result) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
                connection.end();
                return;
            }

            // Si la inserción en ventas fue exitosa, eliminar el presupuesto
            connection.query('DELETE FROM presupuestos WHERE id = ?', [id], (err, deleteResult) => {
                if (err) {
                    res.status(500).send(err.sqlMessage);
                } else if (deleteResult.affectedRows === 0) {
                    res.status(404).send('Presupuesto no encontrado');
                } else {
                    res.status(200).send('Presupuesto aprobado a ventas con éxito');
                }
                connection.end();
            });
        });
    });
});

//--------------||VISITAS||-------------------
app.get('/api/visitas', (req, res) => {
    var connection = mysql.createConnection(credentials);
    connection.query(`
        SELECT 
            visitas.id,  -- Asegúrate de incluir esta columna
            visitas.fecha,
            visitas.motivo,
            login.user AS nombre_vendedor,
            clientes.nombre AS nombre_cliente
        FROM 
            visitas
        JOIN 
            login ON visitas.vendedor_id = login.id
        JOIN 
            clientes ON visitas.cliente_id = clientes.id;
    `, (err, rows) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else {
            res.status(200).send(rows);
        }
        connection.end();
    });
});



app.post('/api/visitas/guardar', (req, res) => {
    const { fecha, motivo, vendedorNombre, clienteNombre } = req.body;
    
    // Establecer la conexión a la base de datos
    var connection = mysql.createConnection(credentials);
    
    // Buscar el ID del vendedor en la tabla login
    connection.query('SELECT id FROM login WHERE user = ?', [vendedorNombre], (err, vendedorResult) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
            connection.end();
            return;
        }
        
        if (vendedorResult.length === 0) {
            res.status(404).send("Vendedor no encontrado");
            connection.end();
            return;
        }
        
        const vendedorId = vendedorResult[0].id;
        
        // Buscar el ID del cliente en la tabla clientes
        connection.query('SELECT id FROM clientes WHERE nombre = ?', [clienteNombre], (err, clienteResult) => {
            if (err) {
                res.status(500).send(err.sqlMessage);
                connection.end();
                return;
            }

            if (clienteResult.length === 0) {
                res.status(404).send("Cliente no encontrado");
                connection.end();
                return;
            }

            const clienteId = clienteResult[0].id;

            // Insertar en la tabla ventas
            const cuerpo = [[fecha, motivo, vendedorId, clienteId]];

            connection.query('INSERT INTO visitas (fecha, motivo, vendedor_id, cliente_id) VALUES ?', [cuerpo], (err, result) => {
                if (err) {
                    res.status(500).send(err.sqlMessage);
                } else {
                    res.status(200).send("Visita");
                }
                connection.end();
            });
        });
    });
});

// Ruta para eliminar un presupuesto
app.post('/api/visitas/eliminar', (req, res) => {
    const { id } = req.body;
    const connection = mysql.createConnection(credentials);

    // Consulta SQL para eliminar un registro
    connection.query('DELETE FROM visitas WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send(err.sqlMessage);
        } else if (result.affectedRows === 0) {
            res.status(404).send('Registro no encontrado');
        } else {
            res.status(200).send('Registro eliminado con éxito');
        }
        connection.end();
    });
});


//--------------||CLIENTES||-------------------
app.get('/api/clientes', (req, res) => {
	var connection = mysql.createConnection(credentials)
	connection.query('SELECT * FROM clientes', (err, rows) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send(rows)
		}
	})
})

app.post('/api/eliminar2', (req, res) => {
	const { id } = req.body
	var connection = mysql.createConnection(credentials)
	connection.query('DELETE FROM clientes WHERE id = ?', id, (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "Usuario Eliminado" })
		}
	})
	connection.end()
})

app.post('/api/guardar2', (req, res) => {
	const { avatar, nombre, empresa, contacto, vendedor_af } = req.body
	const params = [[avatar, nombre, empresa, contacto, vendedor_af]]
	var connection = mysql.createConnection(credentials)
	connection.query('INSERT INTO clientes (avatar, nombre, empresa, contacto, vendedor_af) VALUES ?', [params], (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "Usuario creado" })
		}
	})
	connection.end()
})

app.post('/api/editar2', (req, res) => {
	const { id, avatar, nombre, empresa, contacto, vendedor_af } = req.body
	const params = [avatar, nombre, empresa, contacto, vendedor_af, id]
	var connection = mysql.createConnection(credentials)
	connection.query('UPDATE clientes set avatar = ?, nombre = ?, empresa = ?, contacto = ?, vendedor_af = ? WHERE id = ?', params, (err, result) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send({ "status": "success", "message": "Usuario editado" })
		}
	})
	connection.end()
})

//--------------||GRAFICAS||-------------------
app.get('/api/dashboard', (req, res) => {
	var connection = mysql.createConnection(credentials)
	connection.query('SELECT v.vendedor_id, l.user AS nombre_vendedor, COUNT(*) AS total_ventas FROM ventas v JOIN login l ON v.vendedor_id = l.id GROUP BY v.vendedor_id, l.user ORDER BY total_ventas DESC LIMIT 3', (err, rows) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send(rows)
		}
	})
})

app.get('/api/dashboard/meses', (req, res) => {
    var connection = mysql.createConnection(credentials);
    connection.query(`
        SELECT 
            CASE 
                WHEN MONTH(fecha) = 1 THEN "Enero"
                WHEN MONTH(fecha) = 2 THEN "Febrero"
                WHEN MONTH(fecha) = 3 THEN "Marzo"
                WHEN MONTH(fecha) = 4 THEN "Abril"
                WHEN MONTH(fecha) = 5 THEN "Mayo"
                WHEN MONTH(fecha) = 6 THEN "Junio"
                WHEN MONTH(fecha) = 7 THEN "Julio"
                WHEN MONTH(fecha) = 8 THEN "Agosto"
                WHEN MONTH(fecha) = 9 THEN "Septiembre"
                WHEN MONTH(fecha) = 10 THEN "Octubre"
                WHEN MONTH(fecha) = 11 THEN "Noviembre"
                WHEN MONTH(fecha) = 12 THEN "Diciembre"
            END AS mes, 
            COUNT(*) AS total, 
            "ventas" AS origen 
        FROM ventas
        GROUP BY mes
        UNION ALL 
        SELECT 
            CASE  
                WHEN MONTH(fecha) = 1 THEN "Enero"
                WHEN MONTH(fecha) = 2 THEN "Febrero"
                WHEN MONTH(fecha) = 3 THEN "Marzo"
                WHEN MONTH(fecha) = 4 THEN "Abril"
                WHEN MONTH(fecha) = 5 THEN "Mayo"
                WHEN MONTH(fecha) = 6 THEN "Junio"
                WHEN MONTH(fecha) = 7 THEN "Julio"
                WHEN MONTH(fecha) = 8 THEN "Agosto"
                WHEN MONTH(fecha) = 9 THEN "Septiembre"
                WHEN MONTH(fecha) = 10 THEN "Octubre"
                WHEN MONTH(fecha) = 11 THEN "Noviembre"
                WHEN MONTH(fecha) = 12 THEN "Diciembre"
            END AS mes, 
            COUNT(*) AS total, 
            "presupuestos" AS origen 
        FROM presupuestos
        GROUP BY mes
        ORDER BY FIELD(mes, "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
    `, (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(rows);
        }
    });
});

app.get('/api/dashboard/visitas', (req, res) => {
	var connection = mysql.createConnection(credentials)
	connection.query('SELECT l.user, COUNT(v.vendedor_id) AS cantidad_visitas FROM visitas v JOIN login l ON v.vendedor_id = l.id GROUP BY l.user ORDER BY cantidad_visitas DESC LIMIT 3;', (err, rows) => {
		if (err) {
			res.status(500).send(err)
		} else {
			res.status(200).send(rows)
		}
	})
})


app.listen(4000, async () => {
	const ascified = await asciify('helmet.png', { fit: 'box', width: 10, height: 10 })
	console.log(ascified)
	console.log(figlet.textSync('Seller Server v. 1.0.0'))
})