const db = require("../config/db");

exports.getRooms = (req, res) => {

    db.query(
        `
        SELECT
            id,
            room_number,
            floor_number,
            status
        FROM Rooms
        `,
        (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

};