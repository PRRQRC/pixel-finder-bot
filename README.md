# Super Duper Pixel Finder 2000 _Discord Bot_

This is a Discord for obtaining your stats concerning r/place 2022

Thanks to kisielo85 for the api and [u/opl_](https://reddit.com/user/opl_) for the database! Check out the [original website](http://kisielo85.cba.pl/place2022/) and [it's creator](https://github.com/kisielo85)!

The post with the database: [r/place](https://www.reddit.com/r/place/comments/txh660/dump_of_the_raw_unprocessed_data_i_collected/)


## Setup

Create a config.json file and enter data like this:

```JSON
{
  "clientId": "your-app-id",
  "token": "your-bot-secret"
}
```

Run `npm install`

And you should be able to start the bot using `node index.js`.

## /getjson <user> <trophies>

This command will send you a dm with a json file containing the data.
The data is formatted as following:

```JSON
{
  "username": "shadowlp174",
  "hash": "tLrAdoYjI91qxHPH/BFI1g+txvlKhZzKC12YfqKJ/rSgRc5qv0GpEpLt1xvk6GThiWjKHZM9MpJbvAPHxXNa2g==",
  "pixelsPlaced": 196,
  "pixels": [
    {
      "date": 1648883364000,
      "x": 335,
      "y": 503,
      "color": "#000000",
      "trophies": []
    },
  ],
  "trophies": [0, 1]
}
```

### Explanation

- `username` - the reddit username of the user
- `hash` - the hash of the user's account
- `pixelsPlaced` - the number of pixels placed by the user
- `pixels` - an array of pixels placed by the user:
  - `date` - the date of the pixel
  - `x` - the x coordinate of the pixel
  - `y` - the y coordinate of the pixel
  - `color` - the color of the pixel
  - `trophies` - the trophies the pixel has earned
- `trophies` - an array of trophies the user has:

#### Trophy Mapping

- 0 - `First Placer`
- 1 - `Final Canvas`
- 2 - `End Game`
