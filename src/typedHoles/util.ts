export function isTypeHole(message: string) {
return message.match(/Found hole:.* :: .*\n/).length > 0
}