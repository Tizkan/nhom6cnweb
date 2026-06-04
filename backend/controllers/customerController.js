const db = require("../config/db");

exports.getCustomers = (req, res) => {

    db.query(
        `
        SELECT
            id,
            full_name
        FROM Customers
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