import * as convert from 'xml-js';
import * as fs from 'fs';
import * as t from 'io-ts';
const BasicAttributes = t.type({
    type: t.string,
    id: t.string
});
class BasicAttributesClass {
    constructor(init) {
        this.program = init;
        const decode = BasicAttributes.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildBasicAttributesClass(type) {
    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }
    let out = {
        type: type,
        id: `${getRandomInt(100000000)}`,
    };
    return new BasicAttributesClass(out);
}
const Variable = t.type({
    _attributes: BasicAttributes,
    _text: t.string
});
class VariableClass {
    constructor(init) {
        this.program = init;
        const decode = Variable.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildVariableClass(_text) {
    let out = {
        _attributes: BuildBasicAttributesClass('').program,
        _text: _text
    };
    return new VariableClass(out);
}
const Mutation = t.partial({
    _attributes: t.type({
        name: t.string
    }),
    arg: t.type({
        _attributes: t.type({
            name: t.string,
            varid: t.string
        })
    })
});
class MutationClass {
    constructor(init) {
        this.program = init;
        const decode = Mutation.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildMutationClass(name, argname, varid) {
    let out = {
        _attributes: {
            name: name
        },
        arg: {
            _attributes: {
                name: argname,
                varid: varid
            }
        }
    };
    return new MutationClass(out);
}
const Field = t.type({
    _attributes: t.partial({
        type: t.string,
        id: t.string,
        variableType: t.string
    }),
    _text: t.string
});
class RegularFieldClass {
    constructor(init) {
        this.program = init;
        const decode = Field.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildRegularFieldClass(type, _text) {
    let out = {
        _attributes: {
            type: type
        },
        _text: _text
    };
    return new RegularFieldClass(out);
}
class VariableFieldClass {
    constructor(init) {
        this.program = init;
        const decode = Field.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildVariableFieldClass(type, variableType, _text) {
    let out = {
        _attributes: Object.assign(Object.assign({}, BuildBasicAttributesClass(type).program), { variableType: variableType }),
        _text: _text
    };
    return new VariableFieldClass(out);
}
const Value = t.recursion('Value', () => t.intersection([
    t.type({
        _attributes: t.type({ name: t.string }),
    }), t.partial({
        shadow: t.intersection([
            t.type({
                _attributes: BasicAttributes,
            }), t.partial({
                field: Field
            })
        ]),
        block: Block
    })
]));
class ValueClass {
    constructor(init) {
        this.program = init;
        const decode = Value.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildValueClass(name, block) {
    let out = {
        _attributes: { name: name },
        block: typeof block !== 'undefined' ? block.program : undefined
    };
    return new ValueClass(out);
}
function BuildShadowValueClass(name, shadowType, shadowField, block) {
    let out = {
        _attributes: { name: name },
        shadow: {
            _attributes: BuildBasicAttributesClass(shadowType).program,
            field: shadowField
        },
        block: typeof block !== 'undefined' ? block.program : undefined
    };
    return new ValueClass(out);
}
const Comm = t.type({
    _attributes: t.type({
        pinned: t.keyof({
            true: null,
            false: null
        }),
        h: t.string,
        w: t.string
    }),
    _text: t.string
});
class CommClass {
    constructor(init) {
        this.program = init;
        const decode = Comm.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildCommClass(pinned, h, w, _text) {
    let out = {
        _attributes: {
            pinned: pinned,
            h: h,
            w: w
        },
        _text: _text
    };
    return new CommClass(out);
}
const Statement = t.recursion('Statement', () => t.type({
    _attributes: t.type({
        name: t.string
    }),
    block: Block
}));
class StatementClass {
    constructor(init) {
        this.program = init;
        const decode = Statement.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}
function BuildStatementClass(name, block) {
    let out = {
        _attributes: {
            name: name
        },
        block: block.program
    };
    return new StatementClass(out);
}
const Block = t.recursion('Block', () => t.partial({
    _attributes: t.intersection([
        BasicAttributes,
        t.partial({
            x: t.string,
            y: t.string
        })
    ]),
    value: t.union([Value, t.array(Value)]),
    mutation: t.union([Mutation, t.array(Mutation)]),
    field: Field,
    comment: Comm,
    statement: Statement,
    next: t.type({
        block: Block
    })
}));
class BlockClass {
    constructor(init) {
        this.program = init;
        const decode = Block.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
    addNext(newBlock) {
        if (typeof this.program.next === 'undefined') {
            return new BlockClass(Object.assign(Object.assign({}, this.program), { next: {
                    block: newBlock.program
                } }));
        }
        else {
            return new BlockClass(Object.assign(Object.assign({}, this.program), { next: {
                    block: new BlockClass(this.program.next.block)
                        .addNext(newBlock).program
                } }));
        }
    }
}
function BuildBlockClass(type, value, mutation, field, comment, statement, next) {
    function declassing(inp) {
        return typeof inp !== 'undefined' ? (0 in inp ? inp.map(i => i.program) : inp.program) : undefined;
    }
    let out = {
        _attributes: Object.assign(Object.assign({}, BuildBasicAttributesClass(type).program), { x: "0", y: "0" }),
        value: value,
        mutation: mutation,
        field: field,
        comment: comment,
        statement: statement,
        next: next
    };
    return new BlockClass(out);
}
const XML = t.intersection([
    t.type({
        _declaration: t.type({
            _attributes: t.type({
                version: t.literal('1.0'),
                encoding: t.literal('UTF-8')
            })
        }),
        xml: t.type({
            _attributes: t.type({
                xmlns: t.literal('http://www.w3.org/1999/xhtml')
            }),
            variables: t.partial({
                variable: t.union([Variable, t.array(Variable)])
            })
        })
    }),
    t.partial({
        block: t.union([Block, t.array(Block)])
    })
]);
class XMLClass {
    constructor(init) {
        this.program = {
            _declaration: {
                _attributes: {
                    version: '1.0',
                    encoding: 'UTF-8'
                }
            },
            xml: {
                _attributes: {
                    xmlns: 'http://www.w3.org/1999/xhtml'
                },
                variables: {}
            }
        };
        if (init !== undefined) {
            this.program = init;
        }
        const decode = XML.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
    addBlock(newBlock) {
        if (typeof this.program.xml.block === 'undefined') {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: newBlock.program
                }
            });
        }
        else if ("_attributes" in this.program.xml.block) {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: [this.program.xml.block, newBlock.program]
                }
            });
        }
        else if (0 in this.program.xml.block) {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: this.program.xml.block.concat(newBlock.program)
                }
            });
        }
        else {
            throw new Error("Uh oh");
        }
    }
}
/* ------------------------------------ */
const xml = fs.readFileSync('XML scheme.xml', 'utf8');
const options = { compact: true, spaces: 2 };
let converted = convert.xml2js(xml, options);
//console.log(XML.decode(converted));
//console.log(test.xml.block);
let out = //convert.json2xml(
 JSON.stringify(converted, null, 2);
//, options)
fs.writeFile('out.json', out, () => null);
//console.log(out);
const testXML = new XMLClass()
    .addBlock(BuildBlockClass('sensing_when_splat_pressed', BuildShadowValueClass('SPLAT_NUMBER'))
    .addNext(BuildBlockClass('')));
fs.writeFile('testOut.json', JSON.stringify(testXML.program, null, 2), () => null);
fs.writeFile('testOut.xml', convert.json2xml(JSON.stringify(testXML.program, null, 2), options), () => null);
console.log(testXML);
