{{-- Shared "Verification" block used at the end of every affidavit page. $pronoun: 'my' or 'our'. $deponentLabel: 'Deponent' or 'Deponents'. --}}
<h4>VERIFICATION</h4>
<p>It is verified that the statements made herein are true and correct to the best of {{ $pronoun }} knowledge and belief. Nothing has been concealed therein.</p>
<p>Date : _______________________</p>
<div class="signature-block">
    <div class="signature-right">{{ strtoupper($deponentLabel) }}</div>
</div>
<div class="clear"></div>
