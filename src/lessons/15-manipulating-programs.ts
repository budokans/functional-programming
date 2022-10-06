import * as fs from 'fs'
import { io as IO, console as Console, function as F } from 'fp-ts'

// -----------------------------------------
// library functions
// -----------------------------------------

const readFile = (filename: string): IO.IO<string> => () =>
  fs.readFileSync(filename, 'utf-8')

const writeFile = (filename: string, data: string): IO.IO<void> => () =>
  fs.writeFileSync(filename, data, { encoding: 'utf-8' })

// API derived from the previous functions
const modifyFile = (filename: string, f: (s: string) => string): IO.IO<void> =>
  F.pipe(
    readFile(filename),
    IO.chain((s) => writeFile(filename, f(s)))
  )

// -----------------------------------------
// 1. Program: Read and Modify File
// -----------------------------------------

const program1 = F.pipe(
  readFile('file.txt'),
  IO.chain(Console.log),
  IO.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
  IO.chain(() => readFile('file.txt')),
  IO.chain(Console.log)
)

F.pipe(readFile('file.txt'), IO.chain(Console.log)) // repeated twice above.

// Because of referential transparency, we can refactor into constants.

const read = F.pipe(readFile('file.txt'), IO.chain(Console.log))
const modify = modifyFile('file.txt', (s) => s + '\n// eof')

const program2 = F.pipe(
  read,
  IO.chain(() => modify),
  IO.chain(() => read)
)

// We can even define a combinator and leverage it to compact the code further:

const interleaveIO = <A, B>(action: IO.IO<A>, middle: IO.IO<B>): IO.IO<A> =>
  F.pipe(
    action,
    IO.chain(() => middle),
    IO.chain(() => action)
  )

const program3 = interleaveIO(read, modify)

// -----------------------------------------
// 2. Program: Unix's Time
// -----------------------------------------

import { date as Date } from 'fp-ts'
