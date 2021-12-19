import * as convert from 'xml-js';
import * as fs from 'fs';
import * as t from 'io-ts';


/* ------------------------------------ */

type BasicAttributes = {
    type: string,
    id: string;
};

const BasicAttributes: t.Type<BasicAttributes> = t.type({
    type: t.string,
    id: t.string
});

class BasicAttributesClass {
    program: BasicAttributes;

    constructor(init: BasicAttributes) {
        this.program = init;
        const decode = BasicAttributes.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildBasicAttributesClass(type: string) {
    function getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }
    let out = {
        type: type,
        id: `${getRandomInt(100000000)}`,
    };
    return new BasicAttributesClass(out);
}

/* ------------------------------------ */

type Variable = {
    _attributes: BasicAttributes,
    _text: string;
};

const Variable: t.Type<Variable> = t.type({
    _attributes: BasicAttributes,
    _text: t.string
});

class VariableClass {
    program: Variable;

    constructor(init: Variable) {
        this.program = init;
        const decode = Variable.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildVariableClass(_text: string) {
    let out = {
        _attributes: BuildBasicAttributesClass('').program,
        _text: _text
    };
    return new VariableClass(out);
}

/* ------------------------------------ */

type Mutation = {
    _attributes?: {
        name: string;
    },
    arg?: {
        _attributes: {
            name: string,
            varid: string;
        };
    };
};

const Mutation: t.Type<Mutation> = t.partial({
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
    program: Mutation;

    constructor(init: Mutation) {
        this.program = init;
        const decode = Mutation.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildMutationClass(name: string, argname: string, varid: string) {
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

/* ------------------------------------ */

type Field = {
    _attributes: {
        type?: string,
        id?: string,
        variableType?: string;
    };
    _text: string;
};

const Field: t.Type<Field> = t.type({
    _attributes: t.partial({
        type: t.string,
        id: t.string,
        variableType: t.string
    }),
    _text: t.string
});

class RegularFieldClass {
    program: Field;

    constructor(init: Field) {
        this.program = init;
        const decode = Field.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildRegularFieldClass(type: string, _text: string) {
    let out = {
        _attributes: {
            type: type
        },
        _text: _text
    };
    return new RegularFieldClass(out);
}

class VariableFieldClass {
    program: Field;

    constructor(init: Field) {
        this.program = init;
        const decode = Field.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildVariableFieldClass(type: string, variableType: string, _text: string) {
    let out = {
        _attributes: {
            ...BuildBasicAttributesClass(type).program,
            variableType: variableType
        },
        _text: _text
    };
    return new VariableFieldClass(out);
}

/* ------------------------------------ */

type Value = {
    _attributes: { name: string; },
    shadow?: {
        _attributes: BasicAttributes,
        field?: Field;
    };
    block?: Block;
};

const Value: t.Type<Value> = t.recursion('Value', () =>
    t.intersection([
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
    ])
);

class ValueClass {
    program: Value;

    constructor(init: Value) {
        this.program = init;
        const decode = Value.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildValueClass(name: string, block?: BlockClass) {
    let out = {
        _attributes: { name: name },
        block: typeof block !== 'undefined' ? block.program : undefined
    };
    return new ValueClass(out);
}

function BuildShadowValueClass(name: string, shadowType: string, shadowField?: Field, block?: BlockClass) {
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

/* ------------------------------------ */

type Comm = {
    _attributes: {
        pinned: "true" | "false",
        h: string,
        w: string;
    },
    _text: string;
};

const Comm: t.Type<Comm> = t.type({
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
    program: Comm;

    constructor(init: Comm) {
        this.program = init;
        const decode = Comm.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildCommClass(pinned: "true" | "false", h: string, w: string, _text: string) {
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

/* ------------------------------------ */

type Statement = {
    _attributes: {
        name: string,
    },
    block: Block;
};

const Statement: t.Type<Statement> = t.recursion('Statement', () =>
    t.type({
        _attributes: t.type({
            name: t.string
        }),
        block: Block
    })
);

class StatementClass {
    program: Statement;

    constructor(init: Statement) {
        this.program = init;
        const decode = Statement.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }
}

function BuildStatementClass(name: string, block: BlockClass) {
    let out = {
        _attributes: {
            name: name
        },
        block: block.program
    };
    return new StatementClass(out);
}

/* ------------------------------------ */

type Block = {
    _attributes: BasicAttributes & {
        x?: string,
        y?: string;
    },
    value?: Value | Array<Value>,
    mutation?: Mutation | Array<Mutation>,
    field?: Field,
    comment?: Comm,
    statement?: Statement,
    next?: {
        block: Block;
    };
};

const Block: t.Type<Block> = t.recursion('Block', () =>
    t.partial({
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
    })
);

class BlockClass {
    program: Block;

    constructor(init: Block) {
        this.program = init;
        const decode = Block.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }

    addNext(newBlock: BlockClass): BlockClass {
        if (typeof this.program.next === 'undefined') {
            return new BlockClass({
                ...this.program,
                next: {
                    block: newBlock.program
                }
            });
        } else {
            return new BlockClass({
                ...this.program,
                next: {
                    block: new BlockClass(this.program.next.block)
                        .addNext(newBlock).program
                }
            });
        }
    }
}

function BuildBlockClass(
    type: string,
    value?: ValueClass | Array<ValueClass>,
    mutation?: MutationClass | Array<MutationClass>,
    field?: RegularFieldClass | VariableFieldClass,
    comment?: CommClass,3
    statement?: StatementClass,
    next?: {
        block: Block;
    }
) {
    function declassing(inp: undefined | AnyBlockClass | AnyBlockClass[]) {
        return typeof inp !== 'undefined' ? (0 in inp ? inp.map(i => i.program) : inp.program) : undefined;
    }
    let out = {
        _attributes: {
            ...BuildBasicAttributesClass(type).program,
            x: "0",
            y: "0"
        },
        value: value,
        mutation: mutation,
        field: field,
        comment: comment,
        statement: statement,
        next: next
    };
    return new BlockClass(out);
}

type AnyBlockClass = ValueClass | MutationClass | RegularFieldClass | VariableFieldClass | CommClass | StatementClass;

/* ------------------------------------ */

type XML = {
    _declaration: {
        _attributes: {
            version: "1.0",
            encoding: "UTF-8";
        };
    };
    xml: {
        _attributes: {
            xmlns: "http://www.w3.org/1999/xhtml";
        },
        variables: {
            variable?: Variable | Array<Variable>;
        },
        block?: Block | Array<Block>;
    };
};

const XML: t.Type<XML> = t.intersection([
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
    program: XML = {
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

    constructor(init?: XML) {
        if (init !== undefined) {
            this.program = init;
        }
        const decode = XML.decode(this.program);
        if (decode._tag !== 'Right') {
            throw new Error('IO-TS decode error: ' + JSON.stringify(decode, null, 2));
        }
    }

    addBlock(newBlock: BlockClass): XMLClass {
        if (typeof this.program.xml.block === 'undefined') {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: newBlock.program
                }
            });
        } else if ("_attributes" in this.program.xml.block) {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: [this.program.xml.block, newBlock.program]
                }
            });
        } else if (0 in this.program.xml.block) {
            return new XMLClass({
                _declaration: this.program._declaration,
                xml: {
                    _attributes: this.program.xml._attributes,
                    variables: this.program.xml.variables,
                    block: this.program.xml.block.concat(newBlock.program)
                }
            });
        } else {
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
    .addBlock(BuildBlockClass(
        'sensing_when_splat_pressed',
        BuildShadowValueClass('SPLAT_NUMBER')
    )
        .addNext(BuildBlockClass(''))
    );

fs.writeFile('testOut.json', JSON.stringify(testXML.program, null, 2), () => null);
fs.writeFile('testOut.xml', convert.json2xml(JSON.stringify(testXML.program, null, 2), options), () => null);

console.log(testXML);
