export interface TypedHole {
  name: string;
  type: string;
}

export function isTypedHole(message: string): TypedHole | null {
  const noNewlines: string = message.replace(/\n(\s?)\s*/mg, '$1');

  const match = /Found hole: (.*) :: (.*?)•/.exec(noNewlines);

  if (match == null) {
    return null;
  }

  return {
    name: match[1],
    type: match[2]
  }
}