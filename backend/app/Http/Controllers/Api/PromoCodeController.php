<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromoCodeRequest;
use App\Http\Resources\PromoCodeResource;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    /**
     * Public/Consumer: Validate promo code and get calculated discount.
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'exists:promo_codes,code'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $promoCode = PromoCode::where('code', $request->input('code'))->firstOrFail();

        $validationResult = $promoCode->calculateDiscount((float) $request->input('subtotal'));

        if (!$validationResult['valid']) {
            return RestAPI::response($validationResult['message'], false, 'PROMO_CODE_INVALID');
        }

        return RestAPI::response([
            'valid' => true,
            'discount' => $validationResult['discount'],
            'promo_code' => new PromoCodeResource($promoCode),
        ], true, 'Promo code applied successfully');
    }

    /**
     * Admin: List all promo codes.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = PromoCode::latest();

        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $promoCodes = $query->paginate($request->integer('per_page', 20));

        return RestAPI::setPagination($promoCodes)
            ->response(PromoCodeResource::collection($promoCodes)->resolve());
    }

    /**
     * Admin: Store a new promo code.
     */
    public function store(StorePromoCodeRequest $request): JsonResponse
    {
        $promoCode = PromoCode::create($request->validated());

        return RestAPI::response(new PromoCodeResource($promoCode), true, 'Promo code created successfully');
    }

    /**
     * Admin: Show promo code details.
     */
    public function show(PromoCode $promoCode): JsonResponse
    {
        return RestAPI::response(new PromoCodeResource($promoCode));
    }

    /**
     * Admin: Update promo code.
     */
    public function update(Request $request, PromoCode $promoCode): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:promo_codes,code,' . $promoCode->id],
            'type' => ['sometimes', 'in:percentage,fixed'],
            'value' => ['sometimes', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
            'is_active' => ['boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $promoCode->update($validated);

        return RestAPI::response(new PromoCodeResource($promoCode), true, 'Promo code updated successfully');
    }

    /**
     * Admin: Delete promo code.
     */
    public function destroy(PromoCode $promoCode): JsonResponse
    {
        $promoCode->delete();

        return RestAPI::messageResponse('Promo code deleted successfully');
    }
}
