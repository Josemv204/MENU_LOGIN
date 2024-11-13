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
	var connection = mysql.createConnection(credentials)
	connection.query('SELECT * FROM proyectos', (err, rows) => {
		if (err) {
			res.status(500).send(err.sqlMessage)
		} else {
			res.status(200).send(rows)
		}
	})
	connection.end()
})

app.post('/api/proyectos/guardar', (req, res) => {
	const { titulo, descripcion, fecha } = req.body
	const cuerpo = [[titulo, descripcion, fecha]]
	var connection = mysql.createConnection(credentials)
	connection.query('INSERT INTO proyectos (titulo, descripcion, fecha) VALUES ?', [cuerpo], (err, result) => {
		if (err) {
			res.status(500).send(err.sqlMessage)
		} else {
			res.status(200).send("Proyecto agregado")
		}
	})
	connection.end()
})

app.post('/api/proyectos/eliminar', (req, res) => {
	const { id } = req.body
	var connection = mysql.createConnection(credentials)
	connection.query('DELETE FROM proyectos WHERE id = ?', id, (err, result) => {
		if (err) {
			res.status(500).send(err.sqlMessage)
		} else {
			res.status(200).send("Proyecto eliminado")
		}
	})
	connection.end()
})

app.listen(4000, async () => {
	const ascified = await asciify('helmet.png', { fit: 'box', width: 10, height: 10 })
	console.log(ascified)
	console.log(figlet.textSync('Seller Server v. 1.0.0'))
})