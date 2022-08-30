const express = require('express')
const { Router } = express

const ContenedorArchivo = require('./contenedores/ContenedorArchivo.js')

//--------------------------------------------
// instancio servidor y persistencia

const app = express()

const productosApi = new ContenedorArchivo('../dbProductos.json')
const carritosApi = new ContenedorArchivo('../dbCarritos.json')

//--------------------------------------------
// permisos de administrador

const esAdmin = true

function crearErrorNoEsAdmin(ruta, metodo) {
    const error = {
        error: -1,
    }
    if (ruta && metodo) {
        error.descripcion = `ruta '${ruta}' metodo '${metodo}' no autorizado`
    } else {
        error.descripcion = 'no autorizado'
    }
    return error
}

function soloAdmins(req, res, next) {
    if (!esAdmin) {
        res.json(crearErrorNoEsAdmin())
    } else {
        next()
    }
}

//--------------------------------------------
// configuro router de productos

const productosRouter = new Router()

productosRouter.post('/', soloAdmins, async (req, res) => {
    const save = await productosApi.guardar(req.body);
    res.json(save);
})
productosRouter.get('/', async (req, res)=>{
    const getall = await productosApi.listarAll();
    res.json(getall);
})
productosRouter.get('/:id', async (req, res)=>{
    const id = parseInt(req.params.id);
    const getThis = await productosApi.listar(id);
    res.json(getThis);
})

productosRouter.put('/:id', async (req, res)=>{
   const id = parseInt(req.params.id);
   const obj = req.body;
   await productosApi.actualizar(obj, id);
})
productosRouter.delete('/:id', async (req, res)=>{
    const id = parseInt(req.params.id);
    const deleteThis = await productosApi.borrar(id);
    res.json(deleteThis);
})
//--------------------------------------------
// configuro router de carritos

const carritosRouter = new Router()

carritosRouter.post('/', async (req, res)=> {
    const save = await carritosApi.guardar(req.body);
    res.json(save);
})

carritosRouter.delete('/:id', async (req, res)=>{
    const id = parseInt(req.params.id);
    const deleteThis = await carritosApi.borrar(id);
    res.json(deleteThis);
})

//--------------------------------------------
//configuro cada objeto dentro del objeto carrito

carritosRouter.post('/:id/productos', async (req, res)=> {
    const producto = req.body;
    const id = parseInt(req.params.id);
    const save = await carritosApi.actualizar(producto, id);
    res.json(save);
})

carritosRouter.get('/:id/productos', async (req, res)=>{
    const id = parseInt(req.params.id);
    const getall = await carritosApi.listar(id);
    res.json(getall.productos);
})

carritosRouter.delete('/:id/productos/:id_prod', async (req, res)=>{
    const id = parseInt(req.params.id);
    const id_prod = parseInt(req.params.id_prod);
    const deleteThis = await carritosApi.borrarProdCarrito(id, id_prod);
    res.json(deleteThis);
})

//--------------------------------------------
// configuro el servidor

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/api/productos', productosRouter)
app.use('/api/carritos', carritosRouter)

module.exports = app