export default function handler(req, res) {
    console.log("La llamada llegó al backend");
    // Debe responder a la petición, sino se colgará
    res.status(200).send("Llegó al backend simple.");
};