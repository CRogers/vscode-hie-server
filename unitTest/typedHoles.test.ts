import {expect} from 'chai'

import * as typedHoles from '../src/typedHoles/typedHoles';

// Defines a Mocha test suite to group tests of similar kind together
describe("Typed Hole Tests", () => {

    // Defines a Mocha unit test
    it("should identify a typed hole", () => {
        const typedHole = `
[ghcmod]
• Found hole: _name :: Data.Text.Internal.Lazy.Text -> IO ()
• In the expression: _
  In the expression: _ $ ppllvm myModule
  In an equation for ‘printModule’: printModule = _ $ ppllvm myModule
• Relevant bindings include
    printModule :: IO ()
      (bound at /private/var/folders/gx/7lt1gq996118d06q7g9ft7dd080grz/T/ghc-mod96474/Experiment96473-6.hs:28:1)
        `;

        expect(typedHoles.isTypedHole(typedHole)).to.be.deep.equal({
            name: '_name',
            type: 'Data.Text.Internal.Lazy.Text -> IO ()'
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