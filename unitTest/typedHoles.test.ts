import {expect} from 'chai'

import * as typedHoles from '../src/typedHoles/typedHoles';

// Defines a Mocha test suite to group tests of similar kind together
describe("Typed Hole Tests", () => {

    // Defines a Mocha unit test
    it("should identify a typed hole", () => {
        const typedHole = `
• Found hole: _ :: Data.Text.Internal.Lazy.Text -> IO ()
• In the expression: _
  In the expression: _ $ ppllvm myModule
  In an equation for ‘printModule’: printModule = _ $ ppllvm myModule
• Relevant bindings include
    printModule :: IO ()
      (bound at /private/var/folders/gx/7lt1gq996118d06q7g9ft7dd080grz/T/ghc-mod96474/Experiment96473-6.hs:28:1)
        `;

        expect(typedHoles.isTypedHole(typedHole)).to.be.deep.equal({
            name: '_',
            type: 'Data.Text.Internal.Lazy.Text -> IO ()'
        })
    });

    it("should identify a typed hole that has gone onto many lines", () => {
        const typedHole = `
• Found hole:
    _ :: LLVM.Internal.Target.TargetMachine
         -> File -> LLVM.Internal.Module.Module -> IO ()
• In the expression: _
  In the expression: _ targetMachine (File "foo") llvmModule
  In the second argument of ‘($)’, namely
    ‘\ llvmModule -> _ targetMachine (File "foo") llvmModule’
• Relevant bindings include
    llvmModule :: LLVM.Internal.Module.Module
      (bound at /private/var/folders/gx/7lt1gq996118d06q7g9ft7dd080grz/T/ghc-mod1563/Experiment1562-3.hs:35:51)`;

        expect(typedHoles.isTypedHole(typedHole)).to.be.deep.equal({
            name: '_',
            type: 'LLVM.Internal.Target.TargetMachine -> File -> LLVM.Internal.Module.Module -> IO ()',
        })
    });

    it("should not include the name mis-spelled/not-in-scope message", () => {
        const typedHole = `
• Found hole: _name :: Module
  Or perhaps ‘_name’ is mis-spelled, or not in scope
• In the first argument of ‘ppllvm’, namely ‘_name’
  In the second argument of ‘($)’, namely ‘ppllvm _name’
  In the expression: T.putStrLn $ ppllvm _name
• Relevant bindings include
    printModule :: IO ()
    (bound at /private/var/folders/gx/7lt1gq996118d06q7g9ft7dd080grz/T/ghc-mod2068/Experiment2067-224.hs:28:1)`;

        expect(typedHoles.isTypedHole(typedHole)).to.be.deep.equal({
            name: '_name',
            type: 'Module',
        })
    })

    it("should not include the ambiguous type variables", () => {
        const typedHole = `• Found hole:
    _ :: [Char]
         -> [(LLVM.AST.Type.Type, [Char])]
         -> LLVM.AST.Type.Type
         -> ([LLVM.AST.Operand.Operand] -> m0 ())
         -> t0
  Where: ‘m0’ is an ambiguous type variable
         ‘t0’ is an ambiguous type variable
• In the expression: _
  In the expression: _ "add" [(i32, "a"), (half, "b")] i32
  In a stmt of a 'do' block:
    _ "add" [(i32, "a"), (half, "b")] i32
      $ \ [a, b]
          -> do entry <- block \`named\` "entry"
                do ...
• Relevant bindings include
    myModule :: Module
      (bound at /private/var/folders/gx/7lt1gq996118d06q7g9ft7dd080grz/T/ghc-mod4463/Experiment4462-36.hs:21:1)`;

        expect(typedHoles.isTypedHole(typedHole)).to.be.deep.equal({
            name: '_',
            type: '[Char] -> [(LLVM.AST.Type.Type, [Char])] -> LLVM.AST.Type.Type -> ([LLVM.AST.Operand.Operand] -> m0 ()) -> t0',
        })
    });

    it("should not identify a normal error as a typed hole", () => {
        const normalError = `
[ghcmod]
Variable not in scope:
    foobar :: Data.Text.Internal.Lazy.Text -> IO ()
        `;

        expect(typedHoles.isTypedHole(normalError)).to.be.null
    });
});