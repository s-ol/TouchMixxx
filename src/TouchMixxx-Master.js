/**
*    The TouchMixxx library allows the TouchMixxx controller layout to be used with Mixxx
*    Details and the latest version are available at www.voidratio.co.uk/touchmixxx
*
*    Copyright (C) 2020  VoidRatio <info@voidratio.co.uk>
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
*   This library depends on Components JS library for Mixxx, which is Copyright
*   Be <be.0@gmx.com> and licensed under the GNU General Public License.
*   Documentation is on the Mixxx wiki at http://mixxx.org/wiki/doku.php/components_js
*
*   This library depends on Lodash, which is copyright JS Foundation
*   and other contributors and licensed under the MIT license. Refer to
*   the lodash.mixxx.js file for details.
*
**/

;(function (global){
  var Master = function(midiChannel, group, numberOfSamplers)
  {
    this.midiChannel = midiChannel || 0x09;
    this.group = group || '[Master]';
    this.numberOfSamplers = numberOfSamplers || 64;

    this.ctrls = {
      knobs:{gain: 0x00, balance: 0x01, headGain: 0x02,},
      headMix: 0x03, crossfader: 0x04,fxMix1: 0x06, fxMix2: 0x07,
      shift: 0x08,
      sampleVolume: 0x05,
      loadPage: 0x0A,
      VUMeterL: 0x12, VUMeterR: 0x13,

      fx1Enable: 0x24, fx2Enable: 0x25,
      samplerFx1Enable: 0x26,samplerFx2Enable: 0x27,
      fx1Headphone: 0x28, fx2Headphone: 0x29,

      fxParams: [
      	[{enabled: 0x30, meta: 0x31}, {enabled: 0x32, meta: 0x33}, {enabled: 0x34, meta: 0x35}],
	      [{enabled: 0x40, meta: 0x41}, {enabled: 0x42, meta: 0x43}, {enabled: 0x44, meta: 0x45}],
      ],
    }

    for(knob in this.ctrls.knobs)
    {
      this[knob] = new touchMixxx.Pot({
        midi: [0xB0 + this.midiChannel, this.ctrls.knobs[knob]],
        key: knob,
        group: this.group,
      });
    }

    for(fx in this.ctrls.fxParams)
    {
	    for(i in this.ctrls.fxParams[fx])
	    {
		    var group = '[EffectRack1_EffectUnit'+(+fx+1)+'_Effect' + (+i+1) + ']';
		    var name = 'fx'+(+fx+1)+'Effect'+(+i+1);
	      this[name+'Meta'] = new touchMixxx.Pot({
	        midi: [0xB0 + this.midiChannel, this.ctrls.fxParams[fx][i].meta],
	        key: 'meta',
	        group: group,
	      });
	      this[name+'Enabled'] = new components.Button({
	        midi: [0xB0 + this.midiChannel, this.ctrls.fxParams[fx][i].enabled],
	        key: 'enabled',
	        type: components.Button.prototype.types.toggle,
	        group: group,
	      });
	    }
    }

    for(i in this.ctrls.fx2Params)
    {
      this['fx2Effect'+(i)+'Meta'] = new touchMixxx.Pot({
        midi: [0xB0 + this.midiChannel, this.ctrls.fx2Params[i].meta],
        key: 'meta',
        group: 'EffectRack1_EffectUnit1_Effect1',
      });
      this['fx2Effect'+(i)+'Enable'] = new components.Button({
        midi: [0xB0 + this.midiChannel, this.ctrls.fx2Params[i].enable],
        key: 'enable',
        type: components.Button.prototype.types.toggle,
        group: 'EffectRack1_EffectUnit1_Effect1',
      });
    }

    this.headMix = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.headMix],
      key: 'headMix',
      group: this.group,
      centerZero: true,
    });

    this.crossfader = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.crossfader],
      key: 'crossfader',
      group: this.group,
      centerZero: true,
    });

    this.fx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    this.fxMix1 = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix1],
      key: 'mix',
      group: '[EffectRack1_EffectUnit1]',
    });

    this.fx1Headphone = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx1Headphone],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Headphone]_enable',
    });

    this.fx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_' + this.group + '_enable',
    });

    this.fxMix2 = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.fxMix2],
      key: 'mix',
      group: '[EffectRack1_EffectUnit2]',
    });

    this.fx2Headphone = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.fx2Headphone],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Headphone]_enable',
    });


  /* adjusts the volume for all samplers*/
    this.sampleVolume = new touchMixxx.Pot({
      midi: [0xB0 + this.midiChannel, this.ctrls.sampleVolume],
      key: 'volume',
    group: '[Sampler1]', //hack to force an outgoing connection...
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          engine.setParameter("[Sampler" + s + "]", "volume", value / this.max);
        }
      }
    });

  /* toggle FX 1 for all samplers */
    this.samplerFx1Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx1Enable],
      group: '[EffectRack1_EffectUnit1]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        if(value)
        {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          var key = "group_[Sampler" + s + "]_enable";
          engine.setParameter(this.group, key, ! engine.getParameter(this.group, key));
        }
      }
      }
    });

  /* toggle FX 1 for all samplers */
    this.samplerFx2Enable = new components.Button({
      midi: [0xB0 + this.midiChannel, this.ctrls.samplerFx2Enable],
      group: '[EffectRack1_EffectUnit2]',
      type: components.Button.prototype.types.toggle,
      key: 'group_[Sampler1]_enable',
      numberOfSamplers: this.numberOfSamplers,
      input: function(channel, control, value, status, group)
      {
        if (value)
        {
        for(var s = 1 ; s <= this.numberOfSamplers ; s++)
        {
          var key = "group_[Sampler" + s + "]_enable";
          engine.setParameter(this.group, key, ! engine.getParameter(this.group, key));
        }
      }
      }
    });

    this.vumeter = new touchMixxx.VUMeter({
      midiL:[0xB0 + this.midiChannel, this.ctrls.VUMeterL],
      midiR:[0xB0 + this.midiChannel, this.ctrls.VUMeterR],
      group: this.group,
    });
  };

  touchMixxx.merge("Master",Master);
}(this));
