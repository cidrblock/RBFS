module.exports = {
  //
  // Response Error
  //
  resError: function (message, raw, res) {
    console.log(message, raw)
    res.statusMessage = message;
    if (raw) {
      res.status(400).json({'message': message + ' ' + raw.message + ' ' + raw.stack })
    } else {
      res.status(400).json({'message': message})
    }
    return false;
  },
  //
  // Response Success
  //
  resSuccess: function (data, res) {
    res.send({ "status": "success", "data": data });
  }
};
