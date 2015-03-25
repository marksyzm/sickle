[logo]: https://raw.githubusercontent.com/marksyzm/sickle/master/design/sickle.png "Sickle"

All purpose image proxy for resizing, caching and output.

Sickle.js is pretty simple - you set it up to store your files in a cache directory...

```javascript
var sickle = new Sickle({ cacheDirectory: "./path/to/cache/directory" });
```

then you send it a reachable URL via an object with these dimensions...

```javascript

sickle.get({
	url: "https://github.com/marksyzm/sickle/raw/master/src/design/sickle.png",
	width: 50,
	height: 50,
	crop: true
}, function (err, image) {
	if (image) {
		res.setHeader("content-type", "image/png")
		res.end(image.data, "binary");
	} else res.end("Aaaargh!");
});
```

You can use the callback to retrieve an image object that outputs something like this:

```json
{ Format: 'PNG (Portable Network Graphics)',
  format: 'PNG',
  Geometry: '300x225',
  size: { width: 300, height: 225 },
  Class: 'DirectClass',
  Type: 'true color',
  Depth: '8 bits-per-pixel component',
  depth: 8,
  'Channel Depths': 
   { Red: '8 bits',
     Green: '8 bits',
     Blue: '8 bits',
     Opacity: '1 bits' },
  'Channel Statistics': 
   { Red: 
      { Minimum: '0.00 (0.0000)',
        Maximum: '255.00 (1.0000)',
        Mean: '94.23 (0.3695)',
        'Standard Deviation': '94.89 (0.3721)' },
     Green: 
      { Minimum: '0.00 (0.0000)',
        Maximum: '255.00 (1.0000)',
        Mean: '93.47 (0.3665)',
        'Standard Deviation': '95.44 (0.3743)' },
     Blue: 
      { Minimum: '0.00 (0.0000)',
        Maximum: '255.00 (1.0000)',
        Mean: '104.71 (0.4106)',
        'Standard Deviation': '91.76 (0.3598)' },
     Opacity: 
      { Minimum: '0.00 (0.0000)',
        Maximum: '0.00 (0.0000)',
        Mean: '0.00 (0.0000)',
        'Standard Deviation': '0.00 (0.0000)' } },
  Filesize: '1.6Ki',
  Interlace: 'No',
  Orientation: 'Unknown',
  'Background Color': 'white',
  'Border Color': '#DFDFDF00',
  'Matte Color': '#BDBDBD00',
  'Page geometry': '300x225+0+0',
  Compose: 'Over',
  Dispose: 'Undefined',
  Iterations: '0',
  Compression: 'Zip',
  'Png:IHDR.color-type-orig': '6',
  'Png:IHDR.bit-depth-orig': '8',
  Signature: '4d697a99459ed0aa2dd2e83d1b193ea8a2cee594e8f383f33059688b0f50398b',
  Tainted: 'False',
  path: '/path/to/cache/50-50-nocrop/c27103e5906b5689a8211b7b9d25aef2',
  data: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 01 2c 00 00 00 e1 08 06 00 00 00 72 7c 88 ab 00 00 00 06 62 4b 47 44 00 ff 00 ff 00 ff a0 bd a7 93 ...> }
```

Holy farking schnit!

Then... uh... that's it. The crop option resizes the image too, for laffs. 


## Dependencies
GraphicsMagick

## Install
`npm install sickle`

## Test
Test it from the module directory via `npm test`