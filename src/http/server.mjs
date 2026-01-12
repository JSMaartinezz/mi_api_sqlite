
import http from "http";
import { initializeDatabase, createDbConnection } from "../db/sqliteClient.mjs";
import {
  handleCreateSong,
  handleGetAllSongs,
  handleGetSongById,
  handleUpdateSong,
  handleDeleteSong
} from "../controllers/songsController.mjs";

const initDbConnection = createDbConnection();
initializeDatabase(initDbConnection);

setTimeout(() => {
  initDbConnection.close();
}, 500);

function sendJson(response, statusCode, data) {
  
  const json = JSON.stringify(data, null, 2);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  
  response.end(json);
}


function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let bodyData = "";

    
    request.on("data", (chunk) => {
      
      bodyData += chunk.toString("utf-8");
    });

    
    request.on("end", () => {
      
      
      if (!bodyData) {
        resolve(null);
        return;
      }

      try {
        
        const parsed = JSON.parse(bodyData);
        resolve(parsed);
      } catch (err) {
        
        const error = new Error("El cuerpo de la petición no es JSON válido.");
        error.statusCode = 400; 
        reject(error);
      }
    });

    
    request.on("error", (err) => {
      reject(err);
    });
  });
}


const server = http.createServer(async (req, res) => {
  try {
    const { method, url } = req;

    
    
    if (method === "GET" && url === "/songs") {
      
      const songs = await handleGetAllSongs();
      
      sendJson(res, 200, { ok: true, data: songs });
      return;
    }

    
    if (method === "GET" && url.startsWith("/songs/")) {
      const parts = url.split("/");
      
      const id = parts[2];

      
      const song = await handleGetSongById(id);
      sendJson(res, 200, { ok: true, data: song });
      return;
    }

    
    if (method === "POST" && url === "/songs") {
      
      const body = await parseRequestBody(req);
      
      const newSong = await handleCreateSong(body);
      
      sendJson(res, 201, { ok: true, data: newSong });
      return;
    }

    
    if (method === "PUT" && url.startsWith("/songs/")) {
      const parts = url.split("/");
      const id = parts[2];

      
      const body = await parseRequestBody(req);
      
      const updatedUser = await handleUpdateSong(id, body);
      sendJson(res, 200, { ok: true, data: updatedSongs });
      return;
    }

    
    if (method === "DELETE" && url.startsWith("/songs/")) {
      const parts = url.split("/");
      const id = parts[2];

      
      const result = await handleDeleteSong(id);
      sendJson(res, 200, { ok: true, data: result });
      return;
    }

    
    sendJson(res, 404, { ok: false, error: "Ruta no encontrada" });
  } catch (err) {
    
    console.error("Error en la petición:", err);

   
    const statusCode = err.statusCode || 500;

    sendJson(res, statusCode, {
      ok: false,
      
      error: err.message || "Error interno del servidor"
    });
  }
});


const PORT = 3000;


server.listen(PORT, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${PORT}`);
});