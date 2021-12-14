// Contramap
// (b -> a) -> f a -> f b

// What's important here is that the functor consumes the type, it doesn't contain it.

interface MediaPlayer<A> {
  play: (a: A) => void
  // contramap :: (b -> a) -> MediaPlayer a -> MediaPlayer b
  contramap: <B>(f: (b: B) => A) => MediaPlayer<B>
}

type MP3 = { type: 'mp3'; data: number[] }
type WAV = { type: 'wav'; data: number[] }

const wavToMP3 = (wav: WAV): MP3 => ({
  type: 'mp3',
  data: [
    // Audio conversion magic happens here...
  ]
})

const example = (p: MediaPlayer<MP3>, song: WAV) => {
  // p.play(song); // => types of property 'type' are incompatible
  // SO!

  const q: MediaPlayer<WAV> = p.contramap(wavToMP3)
  q.play(song) // Yay, works!
  // Because we've contramapped from type B to type A first.
}
