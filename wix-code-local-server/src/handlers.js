module.exports = {
    'disconnect': function() { console.log('user disconnected') },
    'GET_VERSION': function(resolve){ resolve(this.getVersion()) },
    'SHOULD_LOAD_OR_CLONE_SITE': function(resolve){ resolve(this.isCloned()) }
}