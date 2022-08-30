const { promises: fs } = require('fs')

class ContenedorArchivo {

    constructor(ruta) {
        this.ruta = ruta;
    }

    async listar(id) {
        try {
            const productos = await this.listarAll();
            const productoId = productos.find(x => x.id == id);
            return productoId;
        } catch (error) {
            console.error(error);
        }
    }

    async listarAll() {
        try {
            const productos = await fs.readFile(this.ruta);
            const productosArray = JSON.parse(productos);
            return productosArray;
        } catch (error) {
            console.error(error);
        }
    }

    async guardar(obj) {
        let id = 0;
        let objeto;
        let array = [];

        try {

            const productos = await this.listarAll();

            if(productos){
                    id = 1 + parseInt(productos.length);
                    const newObjeto = {...obj, id: id};
                    array.push(...productos, newObjeto);  
                    objeto = JSON.stringify(array, null, 2);

                    await fs.writeFile(this.ruta, objeto, (error)=>{
                        if(error) {
                            throw new Error('error de escritura')
                        }
                        console.log('escrito correctamente')
                        })
                
            } else { 
                id = 1;
                const newObjeto = {...obj, id: id};
                array.push(newObjeto); 
                objeto = JSON.stringify(array, null, 2);

                await fs.writeFile(this.ruta, objeto, (error)=>{
                    if(error) {
                        throw new Error('error de escritura')
                    }
                    console.log('escritura exitosa')
                    })
            }
        } catch (error) {
            console.log('No se pudo guardar', error);
        }
    }

    async actualizar(objAct, objetoConId) {
        try {
            let array = [];
            let objeto;

            const objetoId = await this.listar(objetoConId);
            const nuevoObjeto = Object.assign(objetoId, objAct);

            if (await this.borrar(objetoConId)){
                const all = await this.listarAll();
                array.push(...all, nuevoObjeto);
                objeto = JSON.stringify(array, null, 2);
                console.log(array)
            }

                await fs.writeFile(this.ruta, objeto, (error)=> {
                if (error) {
                    throw new Error ('error de actualizado')
                }
                console.log('actualizado correctamente')
            })
        }
        catch (error){
            console.error(error)
        }
    }

    async borrar(id) {
        try {
            const productos = await this.listarAll();
            const deleteId = productos.filter(x => x.id != id);
            const arrayFiltrado = JSON.stringify(deleteId, null, 2);
            await this.borrarAll();
            await fs.writeFile(this.ruta, arrayFiltrado, (error)=>{
                if(error) {
                    throw new Error('error de borrado')
                }
                console.log('borrado exitoso')
            })
            return "borrado";
        } catch (error) {
            console.error(error)
        }
    }


    async borrarAll() {
        try {
            await fs.unlink(this.ruta);
            await fs.writeFile(this.ruta, [], (error)=>{
                if(error) {
                    throw new Error('error de borrado')
                }
                console.log('borrado correctamente')
            })
        } catch (error) {
            console.error(error)
        }
    }

    async borrarProdCarrito(id, id_prod) {
        try {
            const carrito = await this.listar(id);
            const productoBorrar = carrito.productos.filter(x => x.id != id_prod);
            const newCarrito = {id: id, productos: productoBorrar};
            await this.borrar(id);
            await this.guardar(newCarrito)
        }
        catch (error) {
            console.error(error);
        }
    }
}


module.exports = ContenedorArchivo