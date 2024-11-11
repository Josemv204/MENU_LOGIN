import React from 'react'
import { PersonOutlined, HomeOutlined, AssignmentIndOutlined } from '@mui/icons-material'

const sidebarConfig = [
	{
		title: 'inicio',
		path: '/app',
		icon: <HomeOutlined />
	},
	{
		title: 'usuarios',
		path: '/app/usuarios',
		icon: <PersonOutlined />
	},
	{
		title: 'proyectos',
		path: '/app/proyectos',
		icon: <AssignmentIndOutlined />
	}
	
]

export default sidebarConfig