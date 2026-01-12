
import {
  createSong,
  getAllSongs,
  getSongById,
  updateSong,
  deleteSongWithLog
} from "../models/songsModel.mjs";


export async function handleCreateSong(body) {
  
  if (!body || typeof body.title !== "string" || typeof body.genre !== "string" || typeof body.artist !== "string" || typeof body.year !== "string" ) {
    const error = new Error("Datos inválidos. Se requieren 'title' , 'genre' , 'artist' , 'year'  como cadenas.");
    
    error.statusCode = 400;
    
    throw error;
  }

  
  const newSong = await createSong({
    title: body.title,
    genre: body.genre,
    artist: body.artist,
    year: body.year
  });

  
  return newSong;
}


export async function handleGetAllSongs() {
  const songs = await getAllSongs();
  
  return songs;
}


export async function handleGetSongById(idParam) {
  
  const idNumber = Number(idParam);

  
  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400; 
    throw error;
  }

  
  const song = await getSongById(idNumber);

  
  if (!song) {
    const error = new Error("Canción no encontrada.");
    
    error.statusCode = 404;
    throw error;
  }

  
  return song;
}


export async function handleUpdateSong(idParam, body) {
  
  const idNumber = Number(idParam);

  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400;
    throw error;
  }

  
  if (!body || typeof body.title !== "string" || typeof body.genre !== "string" || typeof body.artist !== "string" || typeof body.year !== "string") {
    const error = new Error("Datos inválidos. Se requieren 'titulo' , 'genero' , 'artista' , 'year'  como cadenas.");
    error.statusCode = 400;
    throw error;
  }

  
  const updatedSong = await updateSong({
    id: idNumber,
    title: body.title,
    genre: body.genre,
    artist: body.artist,
    year: body.year
  });

  
  if (!updatedSong) {
    const error = new Error("Usuario no encontrado para actualizar.");
    error.statusCode = 404;
    throw error;
  }

  
  return updatedSong;
}


export async function handleDeleteSong(idParam) {
  
  const idNumber = Number(idParam);

  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    const error = new Error("El parámetro 'id' debe ser un entero positivo.");
    error.statusCode = 400;
    throw error;
  }

  
  const result = await deleteSongWithLog(idNumber);

  
  if (!result) {
    const error = new Error("Usuario no encontrado para borrar.");
    error.statusCode = 404;
    throw error;
  }

  
  return result;
}